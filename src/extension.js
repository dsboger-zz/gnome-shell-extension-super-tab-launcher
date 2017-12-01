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

const SwitcherPopup = imports.ui.switcherPopup;
const AltTab = imports.ui.altTab;
const AppFavorites = imports.ui.appFavorites;
const Shell = imports.gi.Shell;

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

// App witcher mods

let AppSwitcher_init_orig;
let AppSwitcherPopup_init_orig;
let AppSwitcherPopup_initialSelection_orig;
let AppSwitcherPopup_select_orig;
let AppSwitcherPopup_finish_orig;

const AppSwitcher_init_mod = function(apps, altTabPopup) {
	AppSwitcher_init_orig.apply(this, [apps, altTabPopup]);
	// addedApps may differ from apps if 'current-workspace-only' is set
	let addedApps = this.icons.map(function(i) { return i.app; });
	let favorites = AppFavorites.getAppFavorites().getFavorites();
	for (let i in favorites) {
		let favoriteApp = favorites[i];
		if (addedApps.indexOf(favoriteApp) < 0) {
			let appIcon = new AltTab.AppIcon(favoriteApp);
			appIcon.actor.add_style_class_name('super-tab-launcher');
			appIcon.actor.opacity = 128; // cannot set opacity through CSS?
			appIcon.cachedWindows = ["Hi, I'm a window!"]; // hack to hide the arrow
			this._addIcon(appIcon);
			appIcon.cachedWindows = [];
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

const AppSwitcherPopup_initialSelection_mod = function(backward, binding) {
	// favorites are always added after running apps, so if first icon has no windows,
	// there are no running apps
	if (this._items[0].cachedWindows.length == 0 && binding == 'switch-applications') {
		this._select(0);
	} else {
		AppSwitcherPopup_initialSelection_orig.apply(this, [backward, binding]);
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
		openNewAppWindow(appIcon.app);
		SwitcherPopup.SwitcherPopup.prototype._finish.apply(this, [timestamp]);
	} else {
		AppSwitcherPopup_finish_orig.apply(this, [timestamp]);
	}
}

function init(metadata) {
}

function enable() {
	// App switcher mods
	AppSwitcher_init_orig = AltTab.AppSwitcher.prototype._init;
	AltTab.AppSwitcher.prototype._init = AppSwitcher_init_mod;

	AppSwitcherPopup_init_orig = AltTab.AppSwitcherPopup.prototype._init;
	AltTab.AppSwitcherPopup.prototype._init = AppSwitcherPopup_init_mod;

	AppSwitcherPopup_initialSelection_orig = AltTab.AppSwitcherPopup.prototype._initialSelection;
	AltTab.AppSwitcherPopup.prototype._initialSelection = AppSwitcherPopup_initialSelection_mod;

	AppSwitcherPopup_select_orig = AltTab.AppSwitcherPopup.prototype._select;
	AltTab.AppSwitcherPopup.prototype._select = AppSwitcherPopup_select_mod;

	AppSwitcherPopup_finish_orig = AltTab.AppSwitcherPopup.prototype._finish;
	AltTab.AppSwitcherPopup.prototype._finish = AppSwitcherPopup_finish_mod;
}

function disable() {
	// App switcher mods
	AltTab.AppSwitcher.prototype._init = AppSwitcher_init_orig;
	AppSwitcher_init_orig = null;

	AltTab.AppSwitcherPopup.prototype._init = AppSwitcherPopup_init_orig;
	AppSwitcherPopup_init_orig = null;

	AltTab.AppSwitcherPopup.prototype._initialSelection = AppSwitcherPopup_initialSelection_orig;
	AppSwitcherPopup_initialSelection_orig = null;

	AltTab.AppSwitcherPopup.prototype._select = AppSwitcherPopup_select_orig;
	AppSwitcherPopup_select_orig = null;

	AltTab.AppSwitcherPopup.prototype._finish = AppSwitcherPopup_finish_orig;
	AppSwitcherPopup_finish_orig = null;
}

