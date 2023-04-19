"use strict";
chrome.storage.local.set({ pageLoad: 0 });
const utils = {
  domChanged(changes) {
    var isSplitViewEmail;
    changes.map((change) => {
      change.addedNodes[0] &&
        change.addedNodes.forEach((node) => {
          if (!auth.pageLoad) {
            var sdkNode = document.querySelectorAll(".global_app_sidebar");
            if (sdkNode.length > 0) {
              chrome.storage.local.set({ pageLoad: 1 });
              auth.pageLoad = true;
            }
          }
          if (
            (isSplitViewEmail = utils.splitViewEmail(node, change)) ||
            utils.normalViewEmail(node)
          ) {
            let userData = node.getElementsByClassName("gD")[0];

            if (userData) {
              auth.inboxEmail = userData.getAttribute("email");
              auth.inboxName = userData.getAttribute("name");
            }

            certalinkView.style.display =
              window.location.hash.length > 30 ? "block" : "none";
            if (document.getElementById("messageView")) {
              document.getElementById("messageView").style.display =
                window.location.hash.length > 30 ? "block" : "none";
              if (window.location.hash.length > 30) {
                document.getElementById("messageView").children[0].src =
                  "https://portal.certalink.com/version-test/messageview?email=" + auth.inboxEmail + "&" + "sender=" + auth.inboxName ;
              }
            }

            if (window.location.hash.length < 30)
              certalinkView.style.display =
                window.location.hash.length < 30 ? "block" : "none";

            if (document.getElementById("inboxView")) {
              document.getElementById("inboxView").style.display =
                window.location.hash.length < 30 ? "block" : "none";
            }
          }
        });
    });
  },

  hashChange(a) {
    if (document.getElementById("messageView"))
      document.getElementById("messageView").style.display =
        window.location.hash.length > 30 ? "block" : "none";
    if (document.getElementById("inboxView"))
      document.getElementById("inboxView").style.display =
        window.location.hash.length < 30 ? "block" : "none";
  },
  normalViewEmail(node) {
    return node.tagName == "TABLE" && node.className == "Bs nH iY bAt";
  },
  splitViewEmail(node, change) {
    return change.target.nodeName == "TR" && node.className == "Bu";
  },
  clearNode(node) {
    while (node.firstChild) node.removeChild(node.firstChild);
  },
  form2object(form) {
    var data = new FormData(form),
      result = {};
    for (let pair of data.entries()) {
      result[pair[0]] = pair[1];
    }
    form.querySelectorAll("input, textarea").forEach((i) => (i.value = ""));
    form
      .querySelectorAll("select")
      .forEach((s) => (s.children[0].selected = true));
    return result;
  },
};

let observer = new MutationObserver(utils.domChanged);
observer.observe(document.body, { childList: true, subtree: true });
window.onhashchange = utils.hashChange;
const certalinkView = document.createElement("div"),
  messageView = document.createElement("div"),
  inboxView = document.createElement("div"),
  auth = {
    loggedIn: true,
    slug: "",
    token: "",
    id: 0,
    inboxEmail: "",
    inboxName: "",
    oneTimeSend: false,
  };

fetch("chrome-extension://" + chrome.runtime.id + "/gmail/markup.html", {
  credentials: "omit",
  referrerPolicy: "no-referrer-when-downgrade",
  body: null,
  method: "GET",
  mode: "cors",
})
  .then((r) => r.text())
  .then((html) => {
    certalinkView.innerHTML = html;
    chrome.storage.local.get(null, (r) => {
      if (r.auth) {
        auth.id = r.auth.user_id;
        auth.token = r.auth.token;
        auth.slug = r.auth.slug;
        auth.loggedIn = true;
        auth.time_zone = r.time_zone;
      }
    });
  });

InboxSDK.load(2, "sdk_CertaLink_36058f05b1").then((sdk) => {
  const el = document.createElement("div");
  el.innerHTML = certalinkView.innerHTML;
  sdk.Global.addSidebarContentPanel({
    iconUrl: chrome.runtime.getURL("resources/images/nocrm32.png"),
    el,
  });
});