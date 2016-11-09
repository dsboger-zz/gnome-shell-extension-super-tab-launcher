/*
 * GNOME Shell Extension: Super+Tab Launcher
 * Copyright (C) 2016  Davi da Silva Böger
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

const Lang = imports.lang;

const Shell = imports.gi.Shell;

const SwitcherPopup = imports.ui.switcherPopup;
const AltTab = imports.ui.altTab;
const AppFavorites = imports.ui.appFavorites;


let AppSwitcher_init_orig;
let AppSwitcherPopup_init_orig;
let AppSwitcherPopup_select_orig;
let AppSwitcherPopup_finish_orig;

const AppSwitcher_init_mod = function(apps, altTabPopup) {
	AppSwitcher_init_orig.apply(this, [apps, altTabPopup]);
	// addedApps may differ from apps if 'current-workspace-only' is set
	let addedApps = this.icons.map(function(i) { return i.app; });
	let favorites = AppFavorites.getAppFavorites().getFavorites();
	for (let i in favorites) {
		let app = favorites[i];
		if (addedApps.indexOf(app) < 0) {
			let appIcon = new AltTab.AppIcon(app);
			appIcon.actor.add_style_class_name('super-tab-launcher');
			appIcon.cachedWindows = [0]; // Dirty hack to hide the arrow
			this._addIcon(appIcon);
			appIcon.cachedWindows = [];
			appIcon.actor.opacity = 128; // cannot set opacity through CSS?
		}
	}
}

const AppSwitcherPopup_init_mod = function() {
	AppSwitcherPopup_init_orig.apply(this, []);
	if (this._switcherList == undefined) {
		// we know there are no running apps, as we have no _switcherList
		this._switcherList = new AltTab.AppSwitcher([], this);
		this._items = this._switcherList.icons;
	}
}

const AppSwitcherPopup_select_mod = function(app, window, forceAppFocus) {
	let appIcon = this._items[app];
	if (appIcon.cachedWindows.length == 0) {
		// force not to show window thumbnails if app has no windows
		window = null;
		forceAppFocus = true;
	}
	AppSwitcherPopup_select_orig.apply(this, [app, window, forceAppFocus]);
}

const AppSwitcherPopup_finish_mod = function(timestamp) {
	let appIcon = this._items[this._selectedIndex];
	if (appIcon.cachedWindows.length == 0) {
		// if app has no windows, launch it
		// we do not activate() to respect 'current-workspace-only' setting
		appIcon.app.open_new_window(-1);
		SwitcherPopup.SwitcherPopup.prototype._finish.apply(this, [timestamp]);
	} else {
		AppSwitcherPopup_finish_orig.apply(this, [timestamp]);
	}
}

function init(metadata) {
}

function enable() {
	AppSwitcher_init_orig = AltTab.AppSwitcher.prototype._init;
	AltTab.AppSwitcher.prototype._init = AppSwitcher_init_mod;

	AppSwitcherPopup_init_orig = AltTab.AppSwitcherPopup.prototype._init;
	AltTab.AppSwitcherPopup.prototype._init = AppSwitcherPopup_init_mod;

	AppSwitcherPopup_select_orig = AltTab.AppSwitcherPopup.prototype._select;
	AltTab.AppSwitcherPopup.prototype._select = AppSwitcherPopup_select_mod;

	AppSwitcherPopup_finish_orig = AltTab.AppSwitcherPopup.prototype._finish;
	AltTab.AppSwitcherPopup.prototype._finish = AppSwitcherPopup_finish_mod;
}

function disable() {
	AltTab.AppSwitcher.prototype._init = AppSwitcher_init_orig;
	AppSwitcher_init_orig = null;

	AltTab.AppSwitcherPopup.prototype._init = AppSwitcherPopup_init_orig;
	AppSwitcherPopup_init_orig = null;

	AltTab.AppSwitcherPopup.prototype._select = AppSwitcherPopup_select_orig;
	AppSwitcherPopup_select_orig = null;

	AltTab.AppSwitcherPopup.prototype._finish = AppSwitcherPopup_finish_orig;
	AppSwitcherPopup_finish_orig = null;
}

