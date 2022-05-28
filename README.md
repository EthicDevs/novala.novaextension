# NoVala

Advanced Vala language support for Nova (makes use of the Vala Language Server).

[Install from Nova Extensions](https://extensions.panic.com/extensions/dev.ethic/dev.ethic.novala)

![Screenshot](https://i.ibb.co/FVNGFsz/image.png)

## Pre-requisites

- [Vala](https://wiki.gnome.org/Projects/Vala/ValaPlatforms) (`valac`, `libvala`, `glib`, etc) installed on your computer ;
- [Vala Language Server](https://github.com/vala-lang/vala-language-server) installed on your computer ;

## Features

Works on any of the `valac` supported "languages" files: `*.vala`, `*.genie`, `*.gjs`.

- [x] Syntax Highlighting (from the original [Valanova]() extension).
- [x] Hover tooltips
- [x] Code Completion (through the Vala Language Server (VLS), path is configurable).
- [x] Issues (errors & warning from VLS)
- [x] Jump To Definition

- [ ] Debug adapter to debug with GCC (wip)
- [ ] Nova Sidebar to embed local DevDocs files (wip)
- [ ] Hover tooltip with docs from DevDocs if missing from VLS
