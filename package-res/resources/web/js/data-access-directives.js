
define(function() {
	var directives = function($directiveProvider) {
		$directiveProvider("datasourcesettings", ["$timeout", function($timeout) {
			return {
				restrict: 'AE',
				scope: true,
				templateUrl : "content/data-access-v2/resources/web/partials/manage-data-source-settings.html",
				link : function($scope) {
					if (!$scope.text) {
						$scope.text = {};
					}

					$scope.text.noDataSourceSelected = {};
					$scope.text.noDataSourceSelected.message = "Oops. Please select a data source you want to delete.";
					$scope.text.noDataSourceSelected.messageTitle = "Select a Data Source";

					$scope.toggleDialog = function() {
						var $menu = $("#manage-data-source-settings .menu");
						$menu.toggle();

						if ($menu.is(":visible")) {

							// Provide break to bind click event on document
							$timeout(function() {
								$(document).one("click", function() {
									$menu.hide();
								});
							});
						}
					}

					$scope.edit = function() {
						if (!$scope.selectedData) {
							$scope.showNoDataSourceSelectedDlg = true;
							return;
						}
						
						if ($scope.selectedData.type == "JDBC") {
							$scope.goto('/data-access/edit-data-source');
						} else if ($scope.selectedData.type == "Analysis") {
							$scope.goto('/data-access/import-analysis');
						} else if ($scope.selectedData.type == "Metadata") {
							$scope.goto('/data-access/import-metadata');
						}
						
					}

					$scope.delete = function() {
						if (!$scope.selectedData) {
							$scope.showNoDataSourceSelectedDlg = true;
							return;
						}
					}

					$scope.export = function() {
						if (!$scope.selectedData) {
							$scope.showNoDataSourceSelectedDlg = true;
							return;
						}	
					}

					$scope.importAnalysis = function() {
						$scope.goto('/data-access/import-analysis');
					}

					$scope.importMetadata = function() {
					}
					
					$scope.newConnection = function() {
					}
				}
			}
		}]);

		$directiveProvider("messagedialog", ["$sce", function($sce) {
			return {
				restrict: "E",
				scope: {
					id: "@dialogId",
					messageTitle: "@",
					message: "@",
					showOk: "@",
					showCancel: "@",
					onCancelFunc: "&onCancel",
					onOkFunc: "&onOk",
					showDialog: "=",
					okLabel: "@",
					cancelLabel: "@",
					onShow: "&",
					onHide: "&"
				},
				templateUrl : "content/data-access-v2/resources/web/partials/message-dialog.html",
				link : function($scope, $element) {

					$scope.text = {};
					$scope.text.okButton = $scope.okLabel ? $scope.okLabel : "OK";
					$scope.text.cancelButton = $scope.cancelLabel ? $scope.cancelLabel : "Cancel";

					$scope.content = $sce.trustAsHtml($scope.message);

					$scope.$watch("showDialog", function(newValue, oldValue) {
						if (newValue === true) {
							$scope.show();
						}
					})

					$scope.show = function() {
						$("#" + $scope.id).show();
						$("#" + $scope.id+"-glasspane").show();

						if ($scope.onShow) {
							$scope.onShow();
						}
					}

					$scope.hide = function() {
						$("#" + $scope.id).hide();
						$("#" + $scope.id+"-glasspane").hide();
						$scope.showDialog = false;

						if ($scope.onHide) {
							$scope.onHide();
						}
					}

					$scope.onOk = function() {
						if ($scope.onOkFunc) {
							$scope.onOkFunc();
						}

						$scope.hide();
					}

					$scope.onCancel = function() {
						if ($scope.onCancelFunc) {
							$scope.onCancelFunc();
						}

						$scope.hide();
					}

				}
			}
		}]);

		$directiveProvider("draggable", ["$timeout", function($timeout) {
			return {
				restrict: "A",
				scope : {
				},
				link: function($scope, $element, $attrs) {
					$timeout(function() { // Force to be executed after DOM is processed
						var $dragEle = $attrs.draggable ? $("#" + $attrs.draggable) : $element;

						// Add drag behavior
						$dragEle.on("mousedown", function($event) {
							var $ele = $element;
							
							var startX = parseInt($ele.css("margin-left"));
							var startY = parseInt($ele.css("margin-top"));
							var startMouseX = $event.clientX;
							var startMouseY = $event.clientY;

							var move = function($event) {
								var diffX = ($event.clientX - startMouseX);
								var diffY = ($event.clientY - startMouseY);
								var left = startX + diffX;
								var top = startY + diffY;

								$ele.css("margin-left", left);
								$ele.css("margin-top", top);
							}
							$(document).on("mousemove", move);

							var stopMove = function() {
								$(document).off("mousemove", move);
								$(document).off("mouseup", stopMove);
							}
							$(document).on("mouseup", stopMove);
						});
					});
				}
			}
		}]);

		$directiveProvider("dropdown", ["$timeout", function($timeout) {
			return {
				restrict: "E",
				scope: {
					options: "@",
					onSelect: "&"
				},
				templateUrl : "content/data-access-v2/resources/web/partials/dropdown.html",
				link: function($scope, $element, $attrs) {

					$scope.show = function($event) {
						$ele = $($event.target).closest(".dropdown").find(".dropdown-options");
						$ele.toggle();

						if ($ele.is(":visible")) {
							$timeout(function() {
								$(document).one("click", function() {
									$ele.hide();
								})
							});	
						}
					}

					$scope.$watch("options", function(newValue, oldValue) {
						if (newValue == "" || newValue == undefined) {
							return;
						}

						$scope.data = eval(newValue);

						$scope.selectedItemInd = 0;
						$scope.selectedValue = $scope.data[$scope.selectedItemInd];
					});

					$scope.select = function($event, $index) {
						$scope.selectedValue = $scope.data[$index];
						$jEle = $($event.target);

						$jEle.parent().find(".dropdown-item").removeClass("selected");
						$jEle.addClass("selected");
					}
				}
			}
		}])

		$directiveProvider("customtable", function() {
			return {
				restrict: "E",
				scope: {
					headers: "@",
					rows: "@",
					onSelect: "&",
					showFilter: "@"
				},
				templateUrl : "content/data-access-v2/resources/web/partials/customTable.html",
				link: function($scope, $element, $attrs) {
					$scope.showFilter = $scope.showFilter == undefined ? false : eval($scope.showFilter);

					$scope.$watch("headers", function(newValue, oldValue) {
						$scope.headerArray = eval(newValue);
					})

					$scope.$watch("rows", function(newValue, oldValue) {
						$scope.rowArray = eval(newValue);
					})

					$scope.arrowButtonClass = function(reverse) {
						return reverse ? "pentaho-upbutton" : "pentaho-downbutton";	
					}

					$scope.select = function($event, $index) {
						$($event.target).closest(".custom-table").find(".data").removeClass("selected");
						$($event.currentTarget).addClass("selected");

						if ($scope.onSelect) {
							$scope.onSelect({event: $event, index: $index});	
						}
					}

					$scope.reverses = {};
					$scope.predicate = "0";

					$scope.sort = function($index) {
						$scope.reverses[$index] = !$scope.reverses[$index];
						$scope.predicate = ''+$index;
						$scope.reverse = $scope.reverses[$index];
					}

					$scope.resize = function($event) {
						var $ele = $($event.target);

						var $parent = $ele.parent(".header-cell");
						var $parentDataChildren = $(".data .content-cell:nth-child(" + ($parent.index()+1) + ")");

						var $sibling = $parent.prev();
						var $siblingDataChildren = $(".data .content-cell:nth-child(" + ($sibling.index()+1) + ")");

						var startLeft = $ele.position().left;
						var startMouse = $event.clientX;
						
						var siblingExternalWidth = $sibling.outerWidth() - $sibling.width();
						var startSiblingWidth = $sibling[0].getBoundingClientRect().width - siblingExternalWidth;

						var siblingDataChildrenExternalWidth = $siblingDataChildren.outerWidth() - $siblingDataChildren.width();
						var startSiblingDataChildWidth = $siblingDataChildren[0].getBoundingClientRect().width - siblingDataChildrenExternalWidth;
						
						var parentExternalWidth = $parent.outerWidth() - $parent.width();
						var startParentWidth = $parent[0].getBoundingClientRect().width - parentExternalWidth;

						var parentDataChildrenExternalWidth = $parentDataChildren.outerWidth() - $parentDataChildren.width();
						var startParentDataChildrenWidth = $parentDataChildren[0].getBoundingClientRect().width - parentDataChildrenExternalWidth;

						var resize = function($event) {
							var diff = ($event.clientX - startMouse);
							var left = startLeft + diff;
							
							var siblingWidth = startSiblingWidth + diff;
							var parentWidth = startParentWidth - diff;
							
							var siblingDataChildWidth = startSiblingDataChildWidth + diff;
							var parentDataChildrenWidth = startParentDataChildrenWidth - diff;

							var minWidth = 30;
							if (siblingWidth <= minWidth || parentWidth <= minWidth) {
								return;
							}

							$ele.position().left = left;
							
							$sibling.width(siblingWidth);
							$siblingDataChildren.width(siblingDataChildWidth);
							
							$parent.width(parentWidth);
							$parentDataChildren.width(parentDataChildrenWidth);
						}
						$(document).on("mousemove", resize);

						var stopResize = function() {
							$(document).off("mousemove", resize);
							$(document).off("mouseup", stopResize);
						}
						$(document).on("mouseup", stopResize);
					}
				}
			}
		})
	}

	return directives;
})