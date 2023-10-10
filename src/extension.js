/*
 * GNOME Shell Extension: Alt+Tab Launcher
 * Copyright (C) 2023  Jean-Alexandre Anglès d'Auriac
 * Copyright (C) 2018  Davi da Silva Böger
 * 
 * This program is free software: you can redistribute it and/or modify
 * it under the terms of the GNU General Public License as published by
 * the Free Software Foundation, either version 3 of the License, or
 * (at your option) any later version.
 * 
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU General Public License for more details.
 * 
 * You should have received a copy of the GNU General Public License
 * along with this program.  If not, see <http://www.gnu.org/licenses/>.
 */

import {Extension} from 'resource:///org/gnome/shell/extensions/extension.js';

import * as SwitcherPopup from 'resource:///org/gnome/shell/ui/switcherPopup.js';
import * as AltTab from 'resource:///org/gnome/shell/ui/altTab.js';
import * as AppFavorites from 'resource:///org/gnome/shell/ui/appFavorites.js';
import Shell from 'gi://Shell';

function openNewAppWindow(app) {
    if (app.get_n_windows() == 0) {
        app.launch(0, -1, false);
    } else {
        let appInfo = app.get_app_info();
        if (appInfo.list_actions().indexOf('new-window') >= 0) {
            appInfo.launch_action('new-window', null);
        } else {
            app.open_new_window(-1);
        }
    }
}

function addLauncherForApp(app, switcher) {
    let appIcon = new AltTab.AppIcon(app);
    appIcon.add_style_class_name('super-tab-launcher');
    appIcon.opacity = 128; // cannot set opacity through CSS?
    appIcon.cachedWindows = ["Hi, I'm a window!"]; // hack because switcher._addIcon expects a window 
    switcher._addIcon(appIcon);
    appIcon.cachedWindows = [];
    appIcon.actuallyJustLauncher = true;
    return appIcon;
}


const AppSwitcherPopup_init_mod = function() {
    AppSwitcherPopup_init_orig.apply(this, []);
    let favorites = AppFavorites.getAppFavorites().getFavorites();
    let addedApps = this._switcherList.icons.map(function(i) { return i.app; });
    for (let i in favorites) {
        let favoriteApp = favorites[i];
        if (addedApps.indexOf(favoriteApp) < 0) {
            addLauncherForApp(favoriteApp, this._switcherList);
        }
    }
}

const AppSwitcherPopup_select_mod = function(app, window, forceAppFocus) {
    let appIcon = this._items[app];
    if (appIcon.actuallyJustLauncher) {
        // force not to show window thumbnails if app has no windows
        window = null;
        forceAppFocus = true;
    }
    AppSwitcherPopup_select_orig.apply(this, [app, window, forceAppFocus]);
}


const AppSwitcherPopup_finish_mod = function(timestamp) {
    let appIcon = this._items[this._selectedIndex];
    if (appIcon.actuallyJustLauncher) {
        // we do not activate() to respect 'current-workspace-only' setting
        openNewAppWindow(appIcon.app);
        SwitcherPopup.SwitcherPopup.prototype._finish.apply(this, [timestamp]);
    } else {
        AppSwitcherPopup_finish_orig.apply(this, [timestamp]);
    }
}

let AppSwitcherPopup_init_orig;
let AppSwitcherPopup_select_orig;
let AppSwitcherPopup_finish_orig;

export default class PlainExampleExtension extends Extension {
    enable() {
        AppSwitcherPopup_init_orig = AltTab.AppSwitcherPopup.prototype._init;
        AltTab.AppSwitcherPopup.prototype._init = AppSwitcherPopup_init_mod;

        AppSwitcherPopup_select_orig = AltTab.AppSwitcherPopup.prototype._select;
        AltTab.AppSwitcherPopup.prototype._select = AppSwitcherPopup_select_mod;

        AppSwitcherPopup_finish_orig = AltTab.AppSwitcherPopup.prototype._finish;
        AltTab.AppSwitcherPopup.prototype._finish = AppSwitcherPopup_finish_mod;
   }

    disable() {
        AltTab.AppSwitcherPopup.prototype._init = AppSwitcherPopup_init_orig;
        AppSwitcherPopup_init_orig = null;

        AltTab.AppSwitcherPopup.prototype._select = AppSwitcherPopup_select_orig;
        AppSwitcherPopup_select_orig = null;

        AltTab.AppSwitcherPopup.prototype._finish = AppSwitcherPopup_finish_orig;
        AppSwitcherPopup_finish_orig = null;
   }
}
