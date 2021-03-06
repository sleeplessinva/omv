/**
 * This file is part of OpenMediaVault.
 *
 * @license   http://www.gnu.org/licenses/gpl.html GPL Version 3
 * @author    Volker Theile <volker.theile@openmediavault.org>
 * @copyright Copyright (c) 2009-2012 Volker Theile
 *
 * OpenMediaVault is free software: you can redistribute it and/or modify
 * it under the terms of the GNU General Public License as published by
 * the Free Software Foundation, either version 3 of the License, or
 * any later version.
 *
 * OpenMediaVault is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU General Public License for more details.
 *
 * You should have received a copy of the GNU General Public License
 * along with OpenMediaVault. If not, see <http://www.gnu.org/licenses/>.
 */
// require("js/omv/NavigationPanel.js")
// require("js/omv/MessageBox.js")
// require("js/omv/ExecCmdDialog.js")
// require("js/omv/data/DataProxy.js")
// require("js/omv/data/Store.js")
// require("js/omv/grid/TBarGridPanel.js")
// require("js/omv/UploadDialog.js")
// require("js/omv/util/Format.js")

Ext.ns("OMV.Module.System");

// Register the menu.
OMV.NavigationPanelMgr.registerMenu("system", "plugins", {
	text: _("Plugins"),
	icon: "images/plugin.png",
	position: 90
});

/**
 * @class OMV.Module.System.PluginGridPanel
 * @derived OMV.grid.TBarGridPanel
 */
OMV.Module.System.PluginGridPanel = function(config) {
	var initialConfig = {
		modalLoadMask: true,
		hidePagingToolbar: true,
		hideAdd: true,
		hideEdit: true,
		deletionWaitMsg: "Uninstalling selected plugin",
		stateId: "2bd3835f-56c4-4047-942b-7d7b5163de2a",
		viewConfig: {
			forceFit: false
		},
		autoExpandColumn: "info",
		colModel: new Ext.grid.ColumnModel({
			columns: [{
				header: _("Installed"),
				sortable: true,
				dataIndex: "installed",
				id: "installed",
				renderer: OMV.util.Format.booleanIconRenderer(),
				fixed: true,
				menuDisabled: true,
				width: 60,
				align: "center"
			},{
				header: _("Package information"),
				sortable: true,
				dataIndex: "name",
				id: "info",
				renderer: function(val, cell, record, row, col, store) {
					var tpl = new Ext.XTemplate(
					  '<b>{name} {version}</b><br/>',
					  '{description}<br/><br/>',
					  '<tpl if="!Ext.isEmpty(values.longdescription)">',
					    '{[OMV.util.Format.whitespace(values.longdescription)]}<br/>',
					  '</tpl>',
					  _("Size") + ': {[OMV.util.Format.binaryUnit(values.size)]}<br/>',
					  '<tpl if="!Ext.isEmpty(values.maintainer)">',
					    _("Maintainer") + ': {maintainer}<br/>',
					  '</tpl>',
					  '<tpl if="!Ext.isEmpty(values.homepage)">',
					    _("Homepage") + ': {homepage}<br/>',
					  '</tpl>',
					  '<tpl if="!Ext.isEmpty(values.repository)">',
					    _("Repository") + ': {repository}<br/>',
					  '</tpl>');
					return tpl.apply(record.data);
				},
				width: 500
			},{
				header: _("Name"),
				sortable: true,
				dataIndex: "name",
				id: "name",
				width: 180,
				hidden: true
			},{
				header: _("Version"),
				sortable: false,
				dataIndex: "version",
				id: "version",
				width: 120,
				hidden: true
			},{
				header: _("Repository"),
				sortable: true,
				dataIndex: "repository",
				id: "repository",
				width: 160,
				hidden: true
			},{
				header: _("Description"),
				sortable: true,
				dataIndex: "description",
				id: "description",
				renderer: function(val, cell, record, row, col, store) {
					var longdescription = record.get("longdescription");
					if (!Ext.isEmpty(longdescription)) {
						val = "<b>" + val + "</b><br/>" + longdescription;
					}
					return OMV.util.Format.whitespace(val);
				},
				width: 340,
				hidden: true
			},{
				header: _("Size"),
				sortable: true,
				dataIndex: "size",
				id: "size",
				renderer: OMV.util.Format.binaryUnitRenderer(),
				width: 80,
				hidden: true
			},{
				header: _("Maintainer"),
				sortable: true,
				dataIndex: "maintainer",
				id: "maintainer",
				width: 140,
				hidden: true
			},{
				header: _("Homepage"),
				sortable: true,
				dataIndex: "homepage",
				id: "homepage",
				width: 140,
				hidden: true
			}]
		})
	};
	Ext.apply(initialConfig, config);
	OMV.Module.System.PluginGridPanel.superclass.constructor.call(this,
	  initialConfig);
};
Ext.extend(OMV.Module.System.PluginGridPanel, OMV.grid.TBarGridPanel, {
	initComponent : function() {
		this.store = new OMV.data.Store({
			autoLoad: true,
			remoteSort: false,
			proxy: new OMV.data.DataProxy({
				"service": "Plugin",
				"method": "getList"
			}),
			reader: new Ext.data.JsonReader({
				idProperty: "name",
				totalProperty: "total",
				root: "data",
				fields: [
					{ name: "_readOnly" },
					{ name: "name" },
					{ name: "version" },
					{ name: "repository" },
					{ name: "description" },
					{ name: "longdescription" },
					{ name: "homepage" },
					{ name: "maintainer" },
					{ name: "installed" },
					{ name: "size" }
    			]
			})
		});
		OMV.Module.System.PluginGridPanel.superclass.initComponent.apply(
		  this, arguments);
		// Change the 'Del' button text.
		this.getTopToolbar().get(this.getId() + "-delete").text =
		  _("Uninstall");
	},

	initToolbar : function() {
		var tbar = OMV.Module.System.PluginGridPanel.superclass.initToolbar.apply(
		  this);
		tbar.insert(0, {
			id: this.getId() + "-check",
			xtype: "button",
			text: _("Check"),
			icon: "images/reload.png",
			handler: this.cbCheckBtnHdl,
			scope: this
		});
		tbar.insert(1, {
			id: this.getId() + "-upload",
			xtype: "button",
			text: _("Upload"),
			icon: "images/upload.png",
			handler: this.cbUploadBtnHdl,
			scope: this
		});
		tbar.insert(2, {
			id: this.getId() + "-install",
			xtype: "button",
			text: _("Install"),
			icon: "images/add.png",
			handler: this.cbInstallBtnHdl,
			scope: this,
			disabled: true
		});
		return tbar;
	},

	cbSelectionChangeHdl : function(model) {
		OMV.Module.System.PluginGridPanel.superclass.cbSelectionChangeHdl.apply(
		  this, arguments);
		var tbarBtnName = [ "install" ];
		var tbarBtnDisabled = {
			"install": true
		};
		var records = model.getSelections();
		if (records.length <= 0) {
			tbarBtnDisabled["install"] = true;
		} else {
			tbarBtnDisabled["install"] = false;
			// Do not enable the 'Install' button if a plugin is already
			// installed.
			for (var i = 0; i < records.length; i++) {
				if (true === records[i].get("installed")) {
					tbarBtnDisabled["install"] = true;
				}
			}
			
		}
		// Update the button states.
		for (var i = 0; i < tbarBtnName.length; i++) {
			var tbarBtnCtrl = this.getTopToolbar().findById(this.getId() +
			  "-" + tbarBtnName[i]);
			if (!Ext.isEmpty(tbarBtnCtrl)) {
				if (true == tbarBtnDisabled[tbarBtnName[i]]) {
					tbarBtnCtrl.disable();
				} else {
					tbarBtnCtrl.enable();
				}
			}
		}
	},

	cbCheckBtnHdl : function() {
		OMV.MessageBox.wait(null, _("Checking for new plugins ..."));
		OMV.Ajax.request(function(id, response, error) {
			  if (error !== null) {
				  OMV.MessageBox.hide();
				  OMV.MessageBox.error(null, error);
			  } else {
				  this.cmdId = response;
				  OMV.Ajax.request(this.cbIsRunningHdl, this, "Exec",
					"isRunning", { "id": this.cmdId });
			  }
		  }, this, "Apt", "update");
	},

	cbIsRunningHdl : function(id, response, error) {
		if (error !== null) {
			delete this.cmdId;
			OMV.MessageBox.hide();
			OMV.MessageBox.error(null, error);
		} else {
			if (response === true) {
				(function() {
				  OMV.Ajax.request(this.cbIsRunningHdl, this, "Exec",
					"isRunning", { "id": this.cmdId });
				}).defer(500, this);
			} else {
				delete this.cmdId;
				OMV.MessageBox.hide();
				this.doReload();
			}
		}
	},

	cbUploadBtnHdl : function() {
		var wnd = new OMV.UploadDialog({
			title: _("Upload plugin"),
			service: "Plugin",
			method: "upload",
			listeners: {
				success: function(wnd, response) {
					// The upload was successful, now resynchronize the
					// package index files from their sources.
					this.cbCheckBtnHdl();
				},
				scope: this
			}
		});
		wnd.show();
	},

	cbInstallBtnHdl : function() {
		var selModel = this.getSelectionModel();
		var records = selModel.getSelections();
		var packages = [];
		for (var i = 0; i < records.length; i++) {
			var record = records[i];
			packages.push(record.get("name"));
		}
		OMV.MessageBox.show({
			title: _("Confirmation"),
			msg: _("Do you really want to install the selected plugin(s)?"),
			buttons: Ext.Msg.YESNO,
			fn: function(answer) {
				if (answer == "no")
					return;
				var wnd = new OMV.ExecCmdDialog({
					title: _("Install plugins ..."),
					rpcService: "Plugin",
					rpcMethod: "install",
					rpcArgs: { "packages": packages },
					hideStart: true,
					hideStop: true,
					killCmdBeforeDestroy: false,
					listeners: {
						finish: function(wnd, response) {
							wnd.appendValue("\n" + _("Done ..."));
							wnd.setButtonDisabled("close", false);
						},
						exception: function(wnd, error) {
							OMV.MessageBox.error(null, error);
							wnd.setButtonDisabled("close", false);
						},
						close: function() {
							this.doReload();
							OMV.MessageBox.info(null, _("Please reload the page to let the changes take effect."));
						},
						scope: this
					}
				});
				wnd.setButtonDisabled("close", true);
				wnd.show();
				wnd.start();
			},
			scope: this,
			icon: Ext.Msg.QUESTION
		});
	},

	cbDeleteBtnHdl : function() {
		var selModel = this.getSelectionModel();
		var records = selModel.getSelections();
		var packages = [];
		for (var i = 0; i < records.length; i++) {
			var record = records[i];
			packages.push(record.get("name"));
		}
		OMV.MessageBox.show({
			title: _("Confirmation"),
			msg: _("Do you really want to uninstall the selected plugin(s)?"),
			buttons: Ext.Msg.YESNO,
			fn: function(answer) {
				if (answer == "no")
					return;
				var wnd = new OMV.ExecCmdDialog({
					title: _("Uninstall plugins ..."),
					rpcService: "Plugin",
					rpcMethod: "remove",
					rpcArgs: { "packages": packages },
					hideStart: true,
					hideStop: true,
					killCmdBeforeDestroy: false,
					listeners: {
						finish: function(wnd, response) {
							wnd.appendValue("\n" + _("Done ..."));
							wnd.setButtonDisabled("close", false);
						},
						exception: function(wnd, error) {
							OMV.MessageBox.error(null, error);
							wnd.setButtonDisabled("close", false);
						},
						close: function() {
							this.doReload();
							OMV.MessageBox.info(null, _("Please reload the page to let the changes take effect."));
						},
						scope: this
					}
				});
				wnd.setButtonDisabled("close", true);
				wnd.show();
				wnd.start();
			},
			scope: this,
			icon: Ext.Msg.QUESTION
		});
	}
});
OMV.NavigationPanelMgr.registerPanel("system", "plugins", {
	cls: OMV.Module.System.PluginGridPanel
});
