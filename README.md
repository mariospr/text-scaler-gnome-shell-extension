# Text Scaler extension for GNOME Shell

Simple extension that provides a convenient way to set random
values for the text scaling factor, right from the shell's panel.

### How it works

This extension just changes the value of the `text-scaling-factor` GSetting
key from the `org.gnome.desktop.interface` schema, in a similar fashion to
what you can already do from the GNOME Tweak Tool, but from the top panel.

You can select the text scaling factor that you want either my dragging the
slider widget around (0.50 and 3.00 are the minimum and maximum values) or
by directly setting a specific valid value in the text entry.

Last, clicking on "Reset to default value" sets the scaling factor back to 1.00.

This is how the popup menu from the top panel currently looks:

![Screenshot](/screenshot.png)

### How to install

Clone the repository:

    $ git clone git://github.com/mariospr/text-scaler-gnome-shell-extension text-scaler
    $ cd text-scaler

And type:

    $ make install

The extension will be copied in your `$HOME` directory, and can be enabled using
the `gnome-shell-extension-prefs` command or the GNOME Tweak Tool application.

### Contributing

Contributions are welcome via any way, although the preferred method is via GitHub,
by forking the repository and using Pull Requests to integrate your changes.

### License

This extension is released under the terms of the MIT/X11 license.

See the `LICENSE` file for more details.
