# GNOME Shell Extension: Super+Tab Launcher

A GNOME Shell extension that shows favorite app launchers in Super/Alt+Tab popup (a.k.a. app switcher).

Git repository: https://github.com/dsboger/gnome-shell-extension-super-tab-launcher

E.g.o: https://extensions.gnome.org/extension/1133/supertab-launcher/

Have you ever tried to switch to an App, hit Super+Tab (or Alt+Tab) and just then realize the App you sought after is not running? Then you had to cancel the popup, bring the overview and launch the wanted App? This extension aims to streamline the process by adding your (non-running) favorite Apps in the Super+Tab (or Alt+Tab) switcher, after the running Apps: just "switch" to a non-running App and it will be launched!

## Notes

 - Super+Tab Launcher was tested with GNOME Shell 3.22 and 3.24 only
 - It may (and probably will) interfere with other extensions that also modify Super+Tab (or Alt+Tab) switcher. This scenario was not tested yet. If you find an incompatibility that you would like to see fixed, please file a bug report!

## Installation

You may simply go to the e.g.o URL above and install the latest, reviewed release of Super+Tab Launcher. It is also possible to install from the Git repository by cloning (or downloading a release snapshot) and running the following commands from the root folder:


```
./autogen.sh
./configure
make localinstall
```

## License

This program is free software: you can redistribute it and/or modify
it under the terms of the GNU General Public License as published by
the Free Software Foundation, either version 3 of the License, or
(at your option) any later version.

This program is distributed in the hope that it will be useful,
but WITHOUT ANY WARRANTY; without even the implied warranty of
MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
GNU General Public License for more details.

You should have received a copy of the GNU General Public License
along with this program.  If not, see <http://www.gnu.org/licenses/>.
