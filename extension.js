// -*- mode: js; js-indent-level: 4; indent-tabs-mode: nil -*-

const Lang = imports.lang;
const Gio = imports.gi.Gio;
const St = imports.gi.St;
const Main = imports.ui.main;
const PanelMenu = imports.ui.panelMenu;
const PopupMenu = imports.ui.popupMenu;
const Slider = imports.ui.slider;

const Me = imports.misc.extensionUtils.getCurrentExtension();
const Convenience = Me.imports.convenience;
const Gettext = imports.gettext.domain('text-scaler');
const _ = Gettext.gettext;

const DEFAULT_VALUE = 1.00;
const MIN_VALUE = 0.50;
const MAX_VALUE = 3.00;

const NUM_DECIMALS = 2;

const TEXT_SCALING_FACTOR_KEY = 'text-scaling-factor';

// Makes sure that the value is in [MIN_VALUE, MAX_VALUE].
function _normalizeValue(value) {
    return Math.max(MIN_VALUE, Math.min(value, MAX_VALUE));
}

// Translates a value in [MIN_VALUE, MAX_VALUE] to [0.00, 1.00].
function _textScalingToSliderValue(textScaling) {
    return (textScaling - MIN_VALUE) / (MAX_VALUE - MIN_VALUE);
}

// Translates a value in [0.00, 1.00] to [MIN_VALUE, MAX_VALUE].
function _sliderValueToTextScaling(sliderValue) {
    return sliderValue * (MAX_VALUE - MIN_VALUE) + MIN_VALUE;
}

// Checks if a given float number matches the default one using NUM_DECIMALS.
function _isDefaultFloatValue(value) {
    return Math.abs(value - DEFAULT_VALUE) < (Math.pow(10, -NUM_DECIMALS) / 2);
}

const TextScalerButton = new Lang.Class({
    Name: 'TextScalerButton',
    Extends: PanelMenu.Button,

    _init: function() {
        this.parent(0.0, "Text Scaler Button");
        this.setSensitive(true);

        // GSettings to change the text-scaling factor.
        this._settings = new Gio.Settings({ schema_id: 'org.gnome.desktop.interface' });
        this._settings.connect('changed::text-scaling-factor', Lang.bind(this, this._onSettingsChanged));

        // The actual text scaling factor, as a float.
        this._currentValue = this._settings.get_double(TEXT_SCALING_FACTOR_KEY);

        // The value currently displayed by the slider, normalized to [0.00, 1.00].
        this._sliderValue = _textScalingToSliderValue(this._currentValue);

        // Panel menu icon.
        this._hbox = new St.BoxLayout({ style_class: 'panel-status-menu-box' });
        this._hbox.add_child(new St.Icon({ style_class: 'system-status-icon',
                                           icon_name: 'preferences-desktop-font' }));
        this._hbox.add_child(PopupMenu.arrowIcon(St.Side.BOTTOM));
        this.actor.add_child(this._hbox);

        // Popup Menu.
        this._menu = new PopupMenu.PopupMenu(this.actor, 0.0, St.Side.BOTTOM);
        this.setMenu(this._menu);

        this._menuItem = new PopupMenu.PopupBaseMenuItem({ activate: true });
        this._menuItem.actor.connect('key-press-event', Lang.bind(this, this._onMenuItemKeyPressed));
        this._menu.addMenuItem(this._menuItem);

        this._entry = new St.Entry();
        this._entry.clutter_text.connect('activate', Lang.bind(this, this._onEntryActivated));
        this._entry.clutter_text.connect('key-focus-out', Lang.bind(this, this._onEntryKeyFocusOut));
        this._menuItem.actor.add_child(this._entry);

        this._slider = new Slider.Slider(this._sliderValue);
        this._slider.connect('value-changed', Lang.bind(this, this._onSliderValueChanged));
        this._slider.connect('drag-begin', Lang.bind(this, this._onSliderDragBegan));
        this._slider.connect('drag-end', Lang.bind(this, this._onSliderDragEnded));
        this._slider.actor.x_expand = true;
        this._menuItem.actor.add_actor(this._slider.actor);

        this._sliderIsDragging = false;

        this._separatorItem = new PopupMenu.PopupSeparatorMenuItem();
        this._menu.addMenuItem(this._separatorItem);

        this._resetValueItem = new PopupMenu.PopupMenuItem(_("Reset to default value"));
        this._resetValueItem.connect('activate', Lang.bind(this, this._onResetValueActivate));
        this._menu.addMenuItem(this._resetValueItem);

        // Make sure we first update the UI with the current state.
        this._updateUI();
    },

    _onSettingsChanged: function(settings, key) {
        this._updateValue(this._settings.get_double(TEXT_SCALING_FACTOR_KEY), false);
    },

    _onMenuItemKeyPressed: function(actor, event) {
        return this._slider.onKeyPressEvent(actor, event);
    },

    _onEntryActivated: function(entry) {
        this._updateValueFromTextEntry(entry);
    },

    _onEntryKeyFocusOut: function(entry) {
        this._updateValueFromTextEntry(entry);
    },

    _onSliderValueChanged: function(slider, value) {
        this._sliderValue = value;
        this._updateEntry(_sliderValueToTextScaling(value));

        // We don't want to update the value when the user is explicitly
        // dragging the slider by clicking on the handle and moving it
        // around to avoid the unpredictable (and very confusing) behaviour
        // that would happen due to the mouse pointer being on a different
        // area of the screen right after updating the scaling factor.
        if (!this._sliderIsDragging)
            this._updateValue(_sliderValueToTextScaling(this._sliderValue));
    },

    _onSliderDragBegan: function(slider) {
        this._sliderIsDragging = true;
    },

    _onSliderDragEnded: function(slider) {
        // We don't update the scaling factor on 'value-changed'
        // when explicitly dragging, so we need to do it here too.
        this._updateValue(_sliderValueToTextScaling(this._sliderValue));
        this._sliderIsDragging = false;
    },

    _onResetValueActivate: function(menuItem, event) {
        this._updateValue(DEFAULT_VALUE);
    },

    _updateValueFromTextEntry: function(entry) {
        let currentText = entry.get_text();
        let value = parseFloat(currentText);

        // Only update the value if it's a valid one, otherwise
        // simply reset the UI to show the current status again.
        if (isFinite(currentText) && !isNaN(currentText) && !isNaN(value)) {
            this._updateValue(value);
        }

        // Force to always update the UI to make sure that whatever
        // value gets actually applied is displayed as it should be.
        this._updateUI();
    },

    _updateSettings: function() {
        this._settings.set_double(TEXT_SCALING_FACTOR_KEY, this._currentValue);
    },

    _updateValue: function(value, updateSettings=false) {
        if (this._currentValue == value)
            return;

        // Need to keep the value between the valid limits.
        this._currentValue = _normalizeValue(value);

        // We don't always want to update the GSettings (e.g. external change).
        if (!updateSettings) {
            this._updateSettings();
        }

        // Always affect the UI to reflect changes.
        this._updateUI();
    },

    _updateUI: function() {
        this._updateEntry();
        this._updateSlider();
        this._updateResetValueItem();
    },

    _updateEntry: function(value=null) {
        let valueToDisplay = (value != null) ? value : this._currentValue;

        // We only show NUM_DECIMALS decimals on the text entry widget.
        this._entry.set_text(valueToDisplay.toFixed(NUM_DECIMALS));
    },

    _updateSlider: function() {
        this._slider.setValue(_textScalingToSliderValue(this._currentValue));
    },

    _updateResetValueItem: function() {
        this._resetValueItem.setSensitive(!_isDefaultFloatValue(this._currentValue));
    }
});

let _button = null;

function init() {
    Convenience.initTranslations("text-scaler");
}

function enable() {
    _button = new TextScalerButton();
    Main.panel.addToStatusArea('text-scaler-button', _button);
}

function disable() {
    _button.destroy();
}
