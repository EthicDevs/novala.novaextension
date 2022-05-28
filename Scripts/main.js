var client = null;
var compositeDisposable = new CompositeDisposable();

var vlsPath =
  nova.config.get("dev.ethic.novala.config.vlsPath", "string") ||
  "/usr/local/bin/vala-language-server";

function reload() {
  deactivate();
  console.log("reloading...");
  return asyncActivate();
}

function registerCommands() {
  nova.commands.register("dev.ethic.novala.reload", reload);
}

function getValaVersion() {
  return new Promise((resolve, reject) => {
    const process = new Process("/usr/bin/env", {
      args: ["vala", "--version"],
      stdio: ["ignore", "pipe", "ignore"],
    });
    let str = "";
    process.onStdout((versionString) => {
      str += versionString.trim();
    });
    process.onDidExit((status) => {
      if (status === 0) {
        resolve(str.replace("Vala ", ""));
      } else {
        reject(status);
      }
    });
    process.start();
  });
}

function getVLSVersion(vlsPath = null) {
  return new Promise((resolve) => {
    const process = new Process(vlsPath, {
      args: ["--version"],
      stdio: ["ignore", "pipe", "ignore"],
    });
    let str = "";
    process.onStdout((versionString) => {
      str += versionString.trim();
    });
    process.onDidExit(() => {
      resolve(str.replace("vala-language-server ", ""));
    });
    process.start();
  });
}

class SidebarInfosView {
  _treeView = new TreeView("dev.ethic.novala.sidebar.info", {
    dataProvider: this,
  });

  _statusElement = {
    title: "Status",
    value: "Inactive",
    identifier: "novala_status",
  };

  _valaVersionElement = {
    title: "Vala Version",
    value: "Loading...",
    identitier: "vala_version",
  };

  _valaLanguageServerVersionElement = {
    title: "VLS Version",
    value: "Loading...",
    identitier: "vls_version",
  };

  construct() {
    this.getChildren = this.getChildren.bind(this);
    this.getTreeItem = this.getTreeItem.bind(this);
  }

  getChildren(element) {
    if (element == null) {
      return [
        this._statusElement,
        this._valaVersionElement,
        this._valaLanguageServerVersionElement,
      ];
    }
    return [];
  }

  getTreeItem(element) {
    const item = new TreeItem(element.title, TreeItemCollapsibleState.None);
    item.descriptiveText = element.value;
    item.identifier = element.identifier;
    return item;
  }

  reload() {
    if (this._treeView != null) {
      this._treeView.reload();
    }
  }

  dispose() {
    if (this._treeView != null) {
      this.status = "Disposed";
      this._treeView.dispose();
    }
  }

  setStatus(value) {
    this._statusElement.value = value;
    this._treeView.reload(this._statusElement);
  }

  setValaVersion(value) {
    this._valaVersionElement.value = value;
    this._treeView.reload(this._valaVersionElement);
  }

  setVLSVersion(value) {
    this._valaLanguageServerVersionElement.value = value;
    this._treeView.reload(this._valaLanguageServerVersionElement);
  }
}

var sidebarInfosView = new SidebarInfosView();

function registerSidebarInfos() {
  getValaVersion()
    .then((version) => {
      sidebarInfosView._valaVersionElement.value = version;
    })
    .catch((err) => {
      sidebarInfosView._valaVersionElement.value = "?.?.?";
      console.error("Could not find Vala version. Error:", err);
    });

  getVLSVersion(vlsPath || null)
    .then((version) => {
      sidebarInfosView._valaLanguageServerVersionElement.value = version;
    })
    .catch((err) => {
      sidebarInfosView._valaLanguageServerVersionElement.value = "?.?.?";
      console.error(
        "Could not find Vala Language Server (VLS) version. Error:",
        err
      );
    });
}

function startLanguageClient() {
  console.log("config.vlsPath:", vlsPath);

  var useMeson =
    nova.config.get("dev.ethic.novala.config.useMesonBuildSystem", "boolean") ||
    false;
  console.log("config.useMesonBuildSystem:", useMeson);

  var serverOpts = {
    args: [],
    env: {
      G_MESSAGES_DEBUG: "all",
    },
    path: vlsPath,
    type: "stdio", // stdio (default), socket, pipe
  };

  var clientOpts = {
    initializationOptions: {
      initialized: true,
      defaultNamespaces: true,
      defaultVapiDirs: true,
      scanWorkspace: true,
      addUsingNamespaces: true,
      mesonBuildSystem: useMeson,
    },
    syntaxes: ["vala", "genie", "gjs"],
  };

  client = new LanguageClient("novala", "NoVala", serverOpts, clientOpts);
  client.start();
}

function asyncActivate() {
  compositeDisposable.add(sidebarInfosView);
  sidebarInfosView.status = "Activating...";

  registerCommands();
  registerSidebarInfos();
  startLanguageClient();

  sidebarInfosView._statusElement.value = "Running";
  sidebarInfosView.reload();
}

function activate() {
  console.log("activating...");

  if (nova.inDevMode()) {
    var notification = new NotificationRequest("activated");
    notification.body = "NoVala extension is loading...";
    nova.notifications.add(notification);
  }

  return asyncActivate();
}

function deactivate() {
  console.log("deactivating...");
  compositeDisposable.dispose();
  client === null || client === void 0 ? void 0 : client.stop();
}

exports.activate = activate;
exports.deactivate = deactivate;
