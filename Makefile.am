EXTRA_DIST = LICENSE README.md

SUBDIRS = src

zip-file: all
	rm -rf $(builddir)/{_build,_install,$(PACKAGE).zip}; \
	$(MKDIR_P) $(builddir)/_build; \
	cp -r $(srcdir)/src/*.{js,json,css} $(builddir)/_build; \
	(cd "$(builddir)/_build/"; \
	zip -qr "$(abs_top_builddir)/$(PACKAGE).zip" .; \
	); \
	rm -rf $(builddir)/{_build,_install};

localprefix = $(HOME)/.local/share/gnome-shell/extensions

localinstall: zip-file
	uuid="$(PACKAGE).dsboger@gmail.com"; \
	zip_file="$(abs_top_builddir)/$(PACKAGE).zip"; \
	if [ -d "$(localprefix)/$${uuid}" ]; then \
		rm -fR "$(localprefix)/$${uuid}"; \
	fi; \
	$(MKDIR_P) $(localprefix)/$${uuid}; \
	(cd $(localprefix)/$${uuid}; \
		unzip -q $${zip_file}; \
	);
