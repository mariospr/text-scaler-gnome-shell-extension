// -*- mode: js; js-indent-level: 4; indent-tabs-mode: nil -*-

const Lang = imports.lang;
const St = imports.gi.St;
const Main = imports.ui.main;
const PanelMenu = imports.ui.panelMenu;

let _button = null;

const FontResizerButton = new Lang.Class({
    Name: 'FontResizerButton',
    Extends: PanelMenu.Button,

    _init: function() {
        this.parent(0.0, "Font Resizer Button");

        this._icon = new St.Icon({ icon_name: 'zoom-in',
                                   style_class: 'system-status-icon' });
        this.actor.add_child(this._icon);
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
