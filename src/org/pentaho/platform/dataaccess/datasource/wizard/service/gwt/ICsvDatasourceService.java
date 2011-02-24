/*
 * This program is free software; you can redistribute it and/or modify it under the 
 * terms of the GNU Lesser General Public License, version 2.1 as published by the Free Software 
 * Foundation.
 *
 * You should have received a copy of the GNU Lesser General Public License along with this 
 * program; if not, you can obtain a copy at http://www.gnu.org/licenses/old-licenses/lgpl-2.1.html 
 * or from the Free Software Foundation, Inc., 
 * 51 Franklin Street, Fifth Floor, Boston, MA 02110-1301 USA.
 *
 * This program is distributed in the hope that it will be useful, but WITHOUT ANY WARRANTY; 
 * without even the implied warranty of MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.
 * See the GNU Lesser General Public License for more details.
 *
 * Copyright 2008 - 2009 Pentaho Corporation.  All rights reserved.
 *
 *
 * Created June, 2010
 * @author Ezequiel Cuellar
 */
package org.pentaho.platform.dataaccess.datasource.wizard.service.gwt;

import java.io.IOException;
import java.util.List;

import org.dom4j.Document;
import org.pentaho.platform.dataaccess.datasource.wizard.models.FileInfo;
import org.pentaho.platform.dataaccess.datasource.wizard.models.FileTransformStats;
import org.pentaho.platform.dataaccess.datasource.wizard.models.ModelInfo;

import com.google.gwt.user.client.rpc.RemoteService;

public interface ICsvDatasourceService extends RemoteService {

  public ModelInfo stageFile(String name, String delimiter, String enclosure, boolean isFirstRowHeader, String encoding)
      throws Exception;

  public FileInfo[] getStagedFiles() throws Exception;

  public FileTransformStats stageData(ModelInfo modelInfo, boolean truncateTable) throws Exception;

  public List<String> getPreviewRows(String filename, boolean isFirstRowHeader, int rows, String encoding) throws Exception;
  
  public String getEncoding(String fileName) throws Exception;
  
  public List<String> listDatasourceNames() throws IOException;
}