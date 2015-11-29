// -*- mode: js; js-indent-level: 4; indent-tabs-mode: nil -*-

const Lang = imports.lang;
const St = imports.gi.St;
const Main = imports.ui.main;
const PanelMenu = imports.ui.panelMenu;
const PopupMenu = imports.ui.popupMenu;
const Slider = imports.ui.slider;

let _button = null;

const DEFAULT_VALUE = 1.00;
const MIN_VALUE = 0.50;
const MAX_VALUE = 3.00;

const NUM_DECIMALS = 2;

// Translates a value in [MIN_VALUE, MAX_VALUE] to [0.00, 1.00]
function _textScalingToSliderValue(textScaling) {
    return (textScaling - MIN_VALUE) / (MAX_VALUE - MIN_VALUE);
}

// Checks if a given float number matches the default one using NUM_DECIMALS
function isDefaultFloatValue(value) {
    return Math.abs(value - DEFAULT_VALUE) < (Math.pow(10, -NUM_DECIMALS) / 2);
}

const TextScalerButton = new Lang.Class({
    Name: 'TextScalerButton',
    Extends: PanelMenu.Button,

    _init: function() {
        this.parent(0.0, "Text Scaler Button");
        this.setSensitive(true);

        // The actual text scaling factor, as a float
        this._currentValue = DEFAULT_VALUE;

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

        this._separatorItem = new PopupMenu.PopupSeparatorMenuItem();
        this._menu.addMenuItem(this._separatorItem);

        this._resetValueItem = new PopupMenu.PopupMenuItem("Reset to default value");
        this._resetValueItem.connect('activate', Lang.bind(this, this._onResetValueActivate));
        this._menu.addMenuItem(this._resetValueItem);

        this._updateUI();
    },

    _onSliderValueChanged: function(slider, value) {
        let newScalingFactor = value * (MAX_VALUE - MIN_VALUE) + MIN_VALUE;
        this._updateValue(newScalingFactor, slider);
    },

    _onSliderDragEnded: function(slider) {
        // TODO: Actually change the scaling factor here
    },

    _onResetValueActivate: function(menuItem, event) {
        this._updateValue(DEFAULT_VALUE);
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

        this._updateResetValueItem();
    },

    _updateEntry: function() {
        // We only show NUM_DECIMALS decimals on the text entry widget
        this._entry.set_text(this._currentValue.toFixed(NUM_DECIMALS));
    },

    _updateSlider: function() {
        this._slider.setValue(_textScalingToSliderValue(this._currentValue));
    },

    _updateResetValueItem: function() {
        this._resetValueItem.setSensitive(!isDefaultFloatValue(this._currentValue));
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
