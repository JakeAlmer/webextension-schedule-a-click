// using "chrome" instead of "browser" so it works in chrome and firefox

chrome.contextMenus.create({
        id: "schedule-a-click",
        title: "Schedule a Click",
        contexts: ["all"],
});

chrome.contextMenus.onClicked.addListener((info, tab) => {
    if (info.menuItemId === "schedule-a-click") {
        // get the item clicked on
        chrome.tabs.sendMessage(tab.id, { action: "startScheduleAClick" });
    }
});