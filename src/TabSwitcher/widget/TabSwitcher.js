
/*
    Default
    ========================

    @file      : TabSwitcher.js
    @version   : 1.1.1
    @author    : Ivo Sturm
    @date      : 12-10-2017
    @copyright : First Consulting
    @license   : Apache v3

    Documentation
    ========================
    20160531 - First version includes the usage of an attribute of the context object and a microflow to set the active pane of a tab container.
	20171012 - Upgrade to Mx 7. No real changes were needed except an upgrade of the package.xml file. Also added generic _logNode variable.
*/

// Required module list. Remove unnecessary modules, you can always get them back from the boilerplate.
define([
    "dojo/_base/declare",
	"dojo/NodeList-traverse",
    "mxui/widget/_WidgetBase",
	"mxui/dom",
	"dojo/dom-style",
	"dijit/registry"
], function(declare, NodeList, _WidgetBase, dom, domStyle, registry) {
    "use strict";

    // Declare widget's prototype.
    return declare("TabSwitcher.widget.TabSwitcher", [ _WidgetBase ], {

		// Parameters configured in the Modeler.
		tabclass : '',
		tabAttribute : '',
		tabMicroflow: "",
		
		_tabContainer : null,
		_hasStarted : false,
		_tabIndex : 0,
		_logNode : "TabSwitcher widget: ",
		_subscriptionHandle: null,
		_contextObj: null,
		
		// dojo.declare.constructor is called to construct the widget instance. Implement to initialize non-primitive properties.
		constructor: function() {

		},
		postCreate: function () {
			
			this.source = "";
			if (this.tabMicroflow && this.tabAttribute){
				console.error(this._logNode + "ill-configured. Choose either Microflow or Attribute as source");
				this.source = 'Error';
			} else if (this.tabMicroflow) {
				this.source = 'Microflow';			
			} else {
				this.source = 'Attribute';
			}	
			
			this.actLoaded();
		},
				
		update : function(obj, callback) {

			if (this.enableLogging){
				console.log(this._logNode + " Searching for tab pane index: " + this.tabAttribute);
			}
			var newContext = false;
			if(obj !== this._contextObj) {
				this._contextObj = obj;
				if(this._subscriptionHandle) {
					this.unsubscribe(this._subscriptionHandle);
				}
			}

			if (obj){
				if(!this._subscriptionHandle){
					this._subscriptionHandle = 
					this.subscribe({
						guid : obj.getGuid(),
						callback : this.objChanged
					});
				}
				this.contextGUID = obj.getGuid();
				
				if (this.contextGUID) {
					if (this.source === 'Microflow') {
						if (this.enableLogging){
							console.log(this._logNode + " Source=Microflow");
						}
						mx.data.action({
							params: {
								applyto: "selection",
								actionname: this.tabMicroflow,
								guids: [this.contextGUID]
							},
							callback: dojo.hitch(this, function (result) {
								this.selectTab(result);
							}),
							error: function(error) {
								console.log(error.description);
							}
						}, this);
					} else if (this.source === 'Attribute') {
						if (this.enableLogging){
							console.log(this._logNode + "Source=Attribute");
							console.log(this._logNode + "AttributeName="+this.tabAttribute);
						}
						var missingAttrs = false, index = 0;
						if (!obj.has(this.tabAttribute)) {
							missingAttrs = true;
						} else {
							index = obj.get(this.tabAttribute);
						}
						if (this.enableLogging){
							console.log(this._logNode + "Tab Pane Index: " + this.tabAttribute + (missingAttrs ? " is missing " : "") + " Tab Pane Index value: " + index );
						}
						this.selectTab(index);
						
					}
				}
			}		

			typeof(callback) == "function" && callback();
		},
		
		getTab : function ( _tabIndex ) {
			var gototab = null;
			this._tabContainer = dijit.byNode(dojo.query("."+this.tabclass)[0]);

			var tablist = this._tabContainer.getChildren();
			
			if( _tabIndex == null ) 
				_tabIndex = 0;
			if (this.enableLogging){
				console.log(this._logNode + "Searching for tab index: " + _tabIndex);
			}
			
			if (tablist.length > 0 ) {
				if( _tabIndex >= tablist.length ) {
					_tabIndex = tablist.length - 1;
					if (this.enableLogging){
						console.debug(this._logNode + "Setting tab index to: " + _tabIndex);
					}
				}
				
				gototab = tablist[_tabIndex];
	
			}
			return gototab;
		},

		selectTab : function (index) {
			var tab = this.getTab(index);
			if (tab) {
				
				this._tabContainer.showTab(tab);

			}
		},
		
		objChanged : function (objId) {
			mx.data.get({
				guid : objId,
				callback : this.update
			}, this);
		},

		uninitialize : function(){
		}
    });
});

require(["TabSwitcher/widget/TabSwitcher"], function() {
    "use strict";
});
