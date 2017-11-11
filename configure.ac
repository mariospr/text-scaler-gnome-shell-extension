AC_PREREQ(2.63)
AC_INIT([text-scaler],[6],[https://github.com/mariospr/text-scaler-gnome-shell-extension])

AC_CONFIG_MACRO_DIR([m4])

AM_INIT_AUTOMAKE([1.10 dist-xz no-dist-gzip foreign])

AM_SILENT_RULES([yes])

GETTEXT_PACKAGE=text-scaler
AC_SUBST(GETTEXT_PACKAGE)
AC_DEFINE_UNQUOTED(GETTEXT_PACKAGE, "$GETTEXT_PACKAGE",
                   [The prefix for our gettext translation domains.])
IT_PROG_INTLTOOL(0.26)

AC_CONFIG_FILES([
  Makefile
  po/Makefile.in
])
AC_OUTPUT
