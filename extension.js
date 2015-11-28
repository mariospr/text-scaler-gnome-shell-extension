// -*- mode: js; js-indent-level: 4; indent-tabs-mode: nil -*-

const Lang = imports.lang;
const St = imports.gi.St;
const Main = imports.ui.main;
const PanelMenu = imports.ui.panelMenu;
const PopupMenu = imports.ui.popupMenu;
const Slider = imports.ui.slider;

let _button = null;

const TextScalerButton = new Lang.Class({
    Name: 'TextScalerButton',
    Extends: PanelMenu.Button,

    _init: function() {
        this.parent(0.0, "Text Scaler Button");
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

        this._sliderValue = 0.5;
        this._slider = new Slider.Slider(this._sliderValue);
        this._slider.connect('value-changed', Lang.bind(this, this._onSliderValueChanged));
        this._slider.connect('drag-end', Lang.bind(this, this._onSliderDragEnded));

        this._slider.actor.x_expand = true;
        this._menuItem.actor.add_actor(this._slider.actor);
    },

    _onSliderValueChanged: function(value) {
        this._sliderValue = value;
    },

    _onSliderDragEnded: function() {
        // XXX: Temporary placeholder for debugging
        Main.notify("Value changed to: " + this._sliderValue);
    }
});

function init() {
}

function enable() {
    _button = new TextScalerButton();
    Main.panel.addToStatusArea('text-scaler-button', _button);
}

function disable() {
    _button.destroy();
}
