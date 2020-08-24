/*
    Default
    ========================
    @file      : TabSwitcher.js
    @version   : 1.4.0
    @author    : Ivo Sturm
    @date      : 24-08-2020
    @copyright : First Consulting
    @license   : Apache v3
    Documentation
    ========================
    20160531 - First version includes the usage of an attribute of the context object and a microflow to set the active pane of a tab container.
	20171012 - Upgrade to Mx 7. No real changes were needed except an upgrade of the package.xml file. Also added generic _logNode variable.
	20190112 - Made sure to reset the subscription only if the context object changes. Made _updateRendering separate function
	20190131 - refactor + add click listener to set attribute on tab click
	20190710 - added extra check for ill-configuration of widget. A check is now implemented whether the first item on the page, having the TabSwitcher CSS class, is the actual Tab Container.
	20200824 - fix for reloading page not maintaining keeping attribute updated when 'Keep Tab Attribute Updated' is selected
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
		setAttrOnClick: false,
		
		_tabContainer : null,
		_hasStarted : false,
		_tabIndex : 0,
		_logNode : "TabSwitcher widget: ",
		_subscriptionHandleObj: null,
		_subscriptionHandleAttr: null,
		_contextObj: null,
		_clickHandleList: null,
		
		// dojo.declare.constructor is called to construct the widget instance. Implement to initialize non-primitive properties.
		constructor: function() {
			this._clickHandleList = [];
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
			
			//this.actLoaded();
		},
				
		update : function(obj, callback) {

			if (this.enableLogging){
				console.log(this._logNode + " Searching for tab pane index: " + this.tabAttribute);
			}
			this._contextObj = obj;
			this._resetSubscriptions();
			if (obj) {
				this._updateRendering(obj);
			}

			if(this.setAttrOnClick) {
				this._setupClickListeners();
			}		
			typeof(callback) == "function" && callback();
		},
		_updateRendering : function(obj){
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
		},
		getTab : function ( _tabIndex ) {
			var gototab = null;
			
			if (dojo.query("."+this.tabclass)[0].classList.contains('mx-tabcontainer')){
			
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
			} else {
				alert(this._logNode + ' The widget seems ill-configured; only 2 elements on the page can have the CSS class selected in the widget; the Tab Container and the TabSwitcher widget (which should be placed below the Tab Container). Found ' + dojo.query("."+this.tabclass).length + ' elements!');
			}	
		},

		selectTab : function (index) {
			var tab = this.getTab(index);
			if (tab && tab !== this._tabContainer._active) {
				this._tabContainer.showTab(tab);
			}
		},
		
		_objChanged : function (objId) {
			// get the mendix object and update rendering in scenario where context object got changed outside of the widget
			mx.data.get({
				guid : objId,
				callback : this._updateRendering
			}, this);
		},

		_resetSubscriptions: function() {
			this._removeSubscriptions();
			this._addSubscriptions();
		},

		_removeSubscriptions: function() {
			this.unsubscribeAll();
		},

		_addSubscriptions: function() {
			if(this._contextObj) {
				this.unsubscribeAll();
				//obj refresh handler
				this.subscribe({
					guid : this._contextObj.getGuid(),
					callback : this._objChanged
				});
				//attribute change handler
				if(this.tabAttribute ) {
					this.subscribe({
						guid : this._contextObj.getGuid(),
						attr: this.tabAttribute,
						callback : this._objChanged
					});
				}
			}
		},

		_setupClickListeners: function() {
			if(this._contextObj && !this._clickHandleList.length) {
				this._tabContainer = dijit.byNode(dojo.query("."+this.tabclass)[0]);

				//handle the case that the page is being opened again
				var list = dojo.query("."+this.tabclass); //returns a list of tabs from the dom
				if (list){
					list.forEach(function (item){
						var node = dijit.byNode(item); // register each item
						//if multiple items are returned then that means one container is in the process of being destroyed and the other is being created.
						//check for the being destroyed flag and set the tab container correctly
						if (node && !node._beingDestroyed){ 
							this._tabContainer = node;
						}
					}.bind(this));
				}

				var tabList = this._tabContainer.getChildren();
				if(tabList) {
					var onTabClick = this._onTabClick.bind(this);
					tabList.forEach(function(tab) {
						var handle = this.connect(tab.button, "click", function() {
							onTabClick(tab);
						});
						this._clickHandleList.push(handle);
					}.bind(this));
				} else {
					console.error("Could not find tabs to set click listeners");
				}
			}
		},

		//called when a tab is clicked
		_onTabClick: function(tab) {
			var index = this._tabContainer.getChildren().indexOf(tab);
			this._updateTabAttr(index);
		},

		//updates the tab attribute value
		_updateTabAttr: function(index) {
			this._removeSubscriptions();
			this._contextObj.set(this.tabAttribute, index);
			this._addSubscriptions();
		},

		uninitialize: function(){
		}
    });
});

require(["TabSwitcher/widget/TabSwitcher"], function() {
    "use strict";
});
