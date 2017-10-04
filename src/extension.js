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
	if (!backward && this._items[0].cachedWindows.length == 0) {
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
		appIcon.app.open_new_window(-1);
		SwitcherPopup.SwitcherPopup.prototype._finish.apply(this, [timestamp]);
	} else {
		AppSwitcherPopup_finish_orig.apply(this, [timestamp]);
	}
}

// Window switcher mods

let WindowList_init_orig;
let WindowSwitcherPopup_init_orig;
let WindowSwitcherPopup_initialSelection_orig;
let WindowSwitcherPopup_finish_orig;

const WindowList_init_mod = function(windows, mode) {
	WindowList_init_orig.apply(this, [windows, mode]);
	
	let addedApps = this.windows.map(function(w) { return Shell.WindowTracker.get_default().get_window_app(w); });
	let favorites = AppFavorites.getAppFavorites().getFavorites();
	for (let i in favorites) {
		let favoriteApp = favorites[i];
		if (addedApps.indexOf(favoriteApp) < 0) {
			let appIcon = new AltTab.AppIcon(favoriteApp);
			appIcon.set_size(AltTab.APP_ICON_SIZE);
			appIcon.actor.add_style_class_name('super-tab-launcher');
			appIcon.actor.opacity = 128; // cannot set opacity through CSS?
			appIcon.actor.remove_child(appIcon.label); // remove duplicated label
			this.addItem(appIcon.actor, appIcon.label);
			this.icons.push(appIcon);
		}
	}
}

const WindowSwitcherPopup_init_mod = function() {
	WindowSwitcherPopup_init_orig.apply(this, []);
	if (this._switcherList == undefined) {
		let mode = this._settings.get_enum('app-icon-mode');
		// we know there are no windows, as we have no _switcherList
		this._switcherList = new AltTab.WindowList([], mode);
		this._items = this._switcherList.icons;
	}
}

const WindowSwitcherPopup_initialSelection_mod = function(backward, binding) {
	// favorites are always added after open windows, so if first icon has no window,
	// there are no open windows
	if (!backward && !this._items[0].window) {
		this._select(0);
	} else {
		SwitcherPopup.SwitcherPopup.prototype._initialSelection.apply(this, [backward, binding]);
	}
}

const WindowSwitcherPopup_finish_mod = function() {
	let icon = this._items[this._selectedIndex];
	if (!icon.window) {
		// if it is an app icon, launch the app
		// we do not activate() to respect 'current-workspace-only' setting
		icon.app.open_new_window(-1);
		SwitcherPopup.SwitcherPopup.prototype._finish.apply(this, []);
	} else {
		WindowSwitcherPopup_finish_orig.apply(this, []);
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

	// Window switcher mods
	WindowList_init_orig = AltTab.WindowList.prototype._init;
	AltTab.WindowList.prototype._init = WindowList_init_mod;

	WindowSwitcherPopup_init_orig = AltTab.WindowSwitcherPopup.prototype._init;
	AltTab.WindowSwitcherPopup.prototype._init = WindowSwitcherPopup_init_mod;

	WindowSwitcherPopup_initialSelection_orig = AltTab.WindowSwitcherPopup.prototype._initialSelection;
	AltTab.WindowSwitcherPopup.prototype._initialSelection = WindowSwitcherPopup_initialSelection_mod;

	WindowSwitcherPopup_finish_orig = AltTab.WindowSwitcherPopup.prototype._finish;
	AltTab.WindowSwitcherPopup.prototype._finish = WindowSwitcherPopup_finish_mod;
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

	// Window switcher mods
	AltTab.WindowList.prototype._init = WindowList_init_orig;
	WindowList_init_orig = null;

	AltTab.WindowSwitcherPopup.prototype._init = WindowSwitcherPopup_init_orig;
	WindowSwitcherPopup_init_orig = null;

	AltTab.WindowSwitcherPopup.prototype._initialSelection = WindowSwitcherPopup_initialSelection_orig;
	WindowSwitcherPopup_initialSelection_orig = null;

	AltTab.WindowSwitcherPopup.prototype._finish = WindowSwitcherPopup_finish_orig;
	WindowSwitcherPopup_finish_orig = null;
}

