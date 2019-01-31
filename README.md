TabSwitcher

This widget lets you dynamically set the active tab pane of a tab container. 
This can be done by the outcome of a microflow, returning an integer/long, or by using one of the attribtes of the enclosing DataView entity. If you use an attribute, you can also configure the widget to update the attribute when a tab is clicked by the user.

1. Add the widget inside the DataView which holds the tab container you want to control dynamically.
2. Configure the widget by either:
   1. choosing a microflow;
      * be aware that the output of the widget needs to be an integer/long;
   2. selecting the tab pane index attribute of the enclosing DataView entity;
      * if you choose an attribute, also optionally decide whether the widget should listen for tab clicks and update the attribute
3. adding the same CSS class to both the widget and the tabCONTAINER on your page. 
