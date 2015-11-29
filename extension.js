// -*- mode: js; js-indent-level: 4; indent-tabs-mode: nil -*-

const Lang = imports.lang;
const St = imports.gi.St;
const Main = imports.ui.main;
const PanelMenu = imports.ui.panelMenu;
const PopupMenu = imports.ui.popupMenu;
const Slider = imports.ui.slider;

let _button = null;

const MIN_VALUE = 0.50;
const MAX_VALUE = 3.00;

const TextScalerButton = new Lang.Class({
    Name: 'TextScalerButton',
    Extends: PanelMenu.Button,

    _init: function() {
        this.parent(0.0, "Text Scaler Button");
        this.setSensitive(true);

        // The actual text scaling factor, as a float
        this._currentValue = 1.00;

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

        this._entry = new St.Entry();
        this._entry.clutter_text.set_editable(false);
        this._menuItem.actor.add_child(this._entry);

        this._slider = new Slider.Slider(0.0);
        this._slider.connect('value-changed', Lang.bind(this, this._onSliderValueChanged));
        this._slider.connect('drag-end', Lang.bind(this, this._onSliderDragEnded));
        this._slider.actor.x_expand = true;
        this._menuItem.actor.add_actor(this._slider.actor);

        this._updateUI();
    },

    _onSliderValueChanged: function(slider, value) {
        let newScalingFactor = value * (MAX_VALUE - MIN_VALUE) + MIN_VALUE;
        this._updateValue(newScalingFactor, slider);
    },

    _onSliderDragEnded: function(slider) {
        // TODO: Actually change the scaling factor here
    },

    _updateValue: function(value, source=null) {
        if (this._currentValue == value)
            return;

        // Need to keep the value between the valid limits
        this._currentValue = Math.max(MIN_VALUE, Math.min(value, MAX_VALUE));

        this._updateUI(source);
    },

    _updateUI: function(source=null) {
        if (source != this._entry) {
            this._updateEntry();
        }

        if (source != this._slider) {
            this._updateSlider();
        }
    },

    _updateEntry: function() {
        // We only show 2 decimals on the text entry widget
        this._entry.set_text(this._currentValue.toFixed(2));
    },

    _updateSlider: function() {
        // Need to normalize the current value to the [0.0, 1.0] range
        let newSliderValue = (this._currentValue - MIN_VALUE) / (MAX_VALUE - MIN_VALUE);
        this._slider.setValue(newSliderValue);
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
