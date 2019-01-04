TabSwitcher

This widget let’s you dynamically set the active tab pane of a tab container. 
This can be done by the outcome of a microflow, returning an integer/long, or by using one of the attribtes of the enclosing DataView entity.

1.	Add the widget inside the DataView which holds the tab container you want to control dynamically.
2.	Configure the widget by either:
	a.	choosing a microflow;
	i.	be aware that the output of the widget needs to be an integer/long;
	b.	selecting the tab pane index attribute of the enclosing DataView entity; 
	c.	adding the same CSS class to both the widget and the tabCONTAINER on your page. 
