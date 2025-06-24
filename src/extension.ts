// Copyright Sebastian Wiesner <sebastian@swsnr.de>
//
// This Source Code Form is subject to the terms of the Mozilla Public
// License, v. 2.0.If a copy of the MPL was not distributed with this
// file, You can obtain one at https://mozilla.org/MPL/2.0/.
//
// Alternatively, the contents of this file may be used under the terms
// of the GNU General Public License Version 2 or later, as described below:
//
// This program is free software; you can redistribute it and/or modify
// it under the terms of the GNU General Public License as published by
// the Free Software Foundation; either version 2 of the License, or
// (at your option) any later version.
//
// This program is distributed in the hope that it will be useful,
// but WITHOUT ANY WARRANTY; without even the implied warranty of
// MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
// GNU General Public License for more details.

import Gio from "gi://Gio";

import type { ConsoleLike } from "resource:///org/gnome/shell/extensions/extension.js";

import { Destroyer, DestructibleExtension } from "./lib/destructible.js";

const updateTheme = (log: ConsoleLike, settings: Gio.Settings): void => {
  const scheme = settings.get_string("color-scheme");
  if (scheme === "prefer-dark") {
    log.log("Enabling dark gtk3 theme");
    settings.set_string("gtk-theme", "Adwaita-dark");
  } else {
    log.log("Resetting gtk3 theme to default");
    settings.reset("gtk-theme");
  }
};

export default class Gtk3AutoDark extends DestructibleExtension {
  protected override initialize(destroyer: Destroyer): void {
    const log = this.getLogger();
    const settings = Gio.Settings.new("org.gnome.desktop.interface");
    destroyer.addSignal(
      settings,
      settings.connect("changed::color-scheme", () => {
        updateTheme(log, settings);
      }),
    );
    updateTheme(log, settings);
  }
}
