
var deps = [
	"common-ui/util/PentahoSpinner", 
	"common-ui/util/spin.min"
]

define(deps, function(spinner, Spinner) {
	var runningSpinner;

	var showWaiting = function ($container) {
      var config = spinner.getLargeConfig();
      config.color = "#BBB";
      runningSpinner = new Spinner(config);
      var s = runningSpinner.spin();
      $container.append(s.el);
      // $(".data-access-dialog .glasspane").show();
    }

    var stopWaiting = function() {
		runningSpinner.stop();
		// $(".data-access-dialog .glasspane").fadeOut();
    }

	var controllers = function($controllerProvider) {

		// Manage Data Access Controller
		$controllerProvider("ManageDataAccessController", ["$scope", "$filter", "ManageDataSourceService",
			function($scope, $filter, ManageDataSourceService) {
				$scope.text = {};
				$scope.text.title = "Manage Data Source";
				$scope.text.nextButton = "Next";
				$scope.text.prevButton = "Close";
				$scope.text.search = "Search";
				$scope.text.type = "Type";
				$scope.text.name = "Data Source";
				$scope.text.newDataSource = "New Data Source";
				
				$scope.text.edit = "Edit...",
				$scope.text.delete = "Delete",
				$scope.text.export = "Export...",
				$scope.text.importAnalysis = "Import Analysis...",
				$scope.text.importMetadata = "Import Metadata...",
				$scope.text.newConnection = "New Connection..."

				$scope.data = [];
				$scope.typeReverse = 'false';
				$scope.nameReverse = 'false';

				$scope.arrowButtonClass = function(reverse) {
					return reverse ? "pentaho-upbutton" : "pentaho-downbutton";	
				}

				ManageDataSourceService.selectedDataSource(null);

				$scope.select = function($event, $index) {
					$scope.selectedData = $scope.data[$index];
					ManageDataSourceService.selectedDataSource($scope.selectedData);
				}

				$scope.dataHeaders = [$scope.text.name, $scope.text.type];
				$scope.dataRows = [];

				// Add data to the scope
				var dataAdded = 0;
				var addData = function (data) {
					for (i in data) {
						var dataCell = data[i];
						$scope.data.push(dataCell);
						$scope.dataRows.push([dataCell.value, dataCell.type]);
					}

					if (++dataAdded == 4) {
						stopWaiting();
					}
				}

				showWaiting($("#manage-data-sources-data"));
				setTimeout(function() {
					
					// Service Calls
					ManageDataSourceService.getJDBCDataSources(addData);
					ManageDataSourceService.getDSWDataSources(addData);
					ManageDataSourceService.getAnalysisDataSources(addData);
					ManageDataSourceService.getMetadataDataSources(addData);	
				}, 500);
				
			}]);

		$controllerProvider("ImportAnalysisController", ["$scope", "$timeout", "ManageDataSourceService",
			function($scope, $timeout, ManageDataSourceService) {
				$scope.selectedDataSource = ManageDataSourceService.selectedDataSource();

				$scope.text = {};
				$scope.text.title = "Import Analysis";
				$scope.text.mondrianFile = "Mondrian File:";
				$scope.text.dataSourceTitle = "Data Source:";
				$scope.text.manualDataSourceTitle = "Parameters";
				$scope.text.ellipses = "...";
				$scope.text.selectAvailableDataSources = "Select from available data sources.";
				$scope.text.manualDataSource = "Manually enter data source parameter values.";
				$scope.text.okButton = "Import";
				$scope.text.cancelButton = "Close";
				$scope.text.name = "Name";
				$scope.text.value = "Value";
				$scope.text.addParamsTitle = "Parameters";
				$scope.text.close = "Close";

				$scope.manualHeaders = [$scope.text.name, $scope.text.value];
				$scope.manualRows = [];

				$("#availableRadio").attr("checked", true);
				$scope.showAvailable = true;

				$scope.jdbcConnections = "";
				ManageDataSourceService.getJDBCDataSources(function(data) {
					var sources = [];
					for (index in data) {
						sources.push(data[index].value);
					}

					$scope.jdbcConnections = sources;
				})

				$("#importDialog_accept").attr("disabled", true);
				var okDisabled = function() {
					var disabled = $scope.filePath && $scope.filePath.length > 0 && ($scope.showAvailable || $scope.manualRows.length > 0);
					$("#importDialog_accept").attr("disabled", !disabled);
				}

				$scope.$watch("filePath", okDisabled);
				$scope.$watch("manualRows", okDisabled, true);
				$scope.$watch("showAvailable", okDisabled);

				var $browseButton = $("<input type='file'></input>");
				$browseButton.on("change", function() {
					$scope.filePath = $browseButton.val();
					$scope.$apply();
				})

				$scope.upload = function() {
					$browseButton.val(null);
					$browseButton.click();
				}

				$scope.manualParamSelect = function($event, $index) {
					$scope.selectedIndex = $index;
				}

				$scope.removeParameter = function() {
					if ($scope.selectedIndex == undefined) {
						return;
					}

					$scope.manualRows.splice($scope.selectedIndex, 1);
					$scope.selectedIndex = undefined;
				}

				$scope.addParameter = function() {
					$addParamsEles.find("#name").val("");
					$addParamsEles.find("#value").val("");

					$("#add-params").attr("mode", "adding");

					$scope.showAddParamsDialog = true;
				}

				$scope.editParameter = function() {
					if ($scope.selectedIndex == undefined) {
						return;
					}

					var data = $scope.manualRows[$scope.selectedIndex];
					$addParamsEles.find("#name").val(data[0]);
					$addParamsEles.find("#value").val(data[1]);

					$("#add-params").attr("mode", "editing");

					$scope.showAddParamsDialog = true;
				}

				$addParamsEles = $("<div><div>Name:</div><input id='name' type='text'></input><div>Value:</div><input id='value' type='text'></input></div>");

				$scope.addParamsContent = $addParamsEles.html();
				$scope.showAddParamsDialog = false;

				$scope.addParamsOnShow = function() {
					var $dlg = $("#add-params");
					
					if ($dlg.attr("mode") == "adding") {
						$dlg.find("#ok-button").attr("disabled", true);
					}

					$dlg.find("#name, #value").on("keyup", function() {
						var disabled = $dlg.find("#name").val().length == 0 || $dlg.find("#value").val().length == 0;
						$dlg.find("#ok-button").attr("disabled", disabled);
					});					
				}

				$scope.addParamsOnOk = function() {
					var $dlg = $("#add-params");

					var name = $dlg.find("#name").val();
					var value = $dlg.find("#value").val();

					if ($dlg.attr("mode") == "adding") {
						$scope.manualRows.push([name, value]);	
					} else {
						var data = $scope.manualRows[$scope.selectedIndex];
						data[0] = name;
						data[1] = value;
					}
				}
			}]);

		$controllerProvider("NewDataSourceController", ["$scope", "ManageDataSourceService",
			function($scope, ManageDataSourceService) {
				$scope.title="Page1";
			}]);
	}

	return controllers;
})