// -*- mode: js; js-indent-level: 4; indent-tabs-mode: nil -*-

const Lang = imports.lang;
const St = imports.gi.St;
const Main = imports.ui.main;
const PanelMenu = imports.ui.panelMenu;
const PopupMenu = imports.ui.popupMenu;

let _button = null;

const FontResizerButton = new Lang.Class({
    Name: 'FontResizerButton',
    Extends: PanelMenu.Button,

    _init: function() {
        this.parent(0.0, "Font Resizer Button");
        this.setSensitive(true);

        // Panel menu icon
        this._icon = new St.Icon({ icon_name: 'zoom-in',
                                   style_class: 'system-status-icon' });
        this.actor.add_child(this._icon);

        // Popup Menu
        this._menu = new PopupMenu.PopupMenu(this.actor, 0.0, St.Side.BOTTOM);
        this.setMenu(this._menu);

        // Create the text entry and the slider
        this._menuItem = new PopupMenu.PopupBaseMenuItem({ activate: true });
        this._menu.addMenuItem(this._menuItem);

        this._scalingValue = '1.00';
        this._entry = new St.Entry({ text: this._scalingValue });
        this._menuItem.actor.add_child(this._entry);
    }
});

function init() {
}

function enable() {
    _button = new FontResizerButton();
    Main.panel.addToStatusArea('font-resizer-button', _button);
}

function disable() {
    _button.destroy();
}
