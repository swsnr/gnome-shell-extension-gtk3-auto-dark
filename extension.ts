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

import { Extension } from "resource:///org/gnome/shell/extensions/extension.js";

/**
 * Something we can destroy.
 */
export interface Destructible {
  destroy(): void;
}

/**
 * An abstract class representing a destructible extension.
 *
 * This class handles the infrastructure for enabling and disabling the
 * extension; implementations only need to provide initialization.
 */
export abstract class DestructibleExtension extends Extension {
  private enabledExtension?: Destructible | null;

  /**
   * Initialize this extension.
   */
  abstract initialize(): Destructible;

  /**
   * Get the declared version of this extension.
   */
  get version(): string {
    return this.metadata["version-name"] ?? "n/a";
  }

  /**
   * Enable this extension.
   *
   * If not already enabled, call `initialize` and keep track its allocated resources.
   */
  override enable(): void {
    if (!this.enabledExtension) {
      console.log(`Enabling extension ${this.metadata.uuid} ${this.version}`);
      this.enabledExtension = this.initialize();
      console.log(
        `Extension ${this.metadata.uuid} ${this.version} successfully enabled`
      );
    }
  }

  /**
   * Disable this extension.
   *
   * If existing, destroy the allocated resources of `initialize`.
   */
  override disable(): void {
    console.log(`Disabling extension ${this.metadata.uuid} ${this.version}`);
    this.enabledExtension?.destroy();
    this.enabledExtension = null;
  }
}

const updateTheme = (settings: Gio.Settings): void => {
  const scheme = settings.get_string("color-scheme");
  if (scheme === "prefer-dark") {
    console.log("Enabling dark gtk3 theme");
    settings.set_string("gtk-theme", "Adwaita-dark");
  } else {
    console.log("Resetting gtk3 theme to default");
    settings.reset("gtk-theme");
  }
};

export default class Gtk3AutoDark extends DestructibleExtension {
  override initialize(): Destructible {
    const settings = Gio.Settings.new("org.gnome.desktop.interface");
    updateTheme(settings);
    const signalId = settings.connect("changed::color-scheme", () => {
      updateTheme(settings);
    });
    return {
      destroy() {
        settings.disconnect(signalId);
      },
    };
  }
}
