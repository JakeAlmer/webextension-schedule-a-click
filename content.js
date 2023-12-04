let clickedElement = null;

document.addEventListener("contextmenu", event => {
    clickedElement = event.target;
}, true);

chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
    if (message.action === "startScheduleAClick") {
        showTimeSelectorDialog(clickedElement)
            .then(time => {
                var date = new Date();
                var hours = parseInt(time.split(':')[0]);
                var minutes = parseInt(time.split(':')[1]);
                date.setHours(hours, minutes, 0, 0);

                console.log('Selected Time:', date);

                scheduleClick(clickedElement, date);
            })
            .catch(error => {
                console.log(error);
            });
    }
});


function showTimeSelectorDialog(clickedElement) {
    return new Promise((resolve, reject) => {

        // Create the dialog elements
        var dialog = document.createElement('dialog');
        dialog.id = 'timeDialog';

        var selectedElementLabel = document.createElement('p');
        selectedElementLabel.textContent = 'Selected Element: ' + clickedElement.tagName + "#" + clickedElement.id;
        dialog.appendChild(selectedElementLabel);

        var timeLabel = document.createElement('p');
        timeLabel.textContent = 'Select Time:';
        dialog.appendChild(timeLabel);

        var nextHour = new Date();
        nextHour.setHours(nextHour.getHours() + 1);
        nextHour.setMinutes(0);
        nextHour.setSeconds(0);
        nextHour.setMilliseconds(0);

        var timeInput = document.createElement('input');
        timeInput.type = 'time';
        timeInput.id = 'timeInput';
        timeInput.value = nextHour.getHours().toString().padStart(2, '0') + ":" + nextHour.getMinutes().toString().padStart(2, '0');
        dialog.appendChild(timeInput);

        var confirmButton = document.createElement('button');
        confirmButton.textContent = 'Confirm';
        dialog.appendChild(confirmButton);

        var closeButton = document.createElement('button');
        closeButton.textContent = 'Cancel';
        dialog.appendChild(closeButton);

        document.body.appendChild(dialog);
        dialog.showModal();

        confirmButton.addEventListener('click', function () {
            resolve(timeInput.value);
            dialog.close();
            dialog.remove();
        });

        closeButton.addEventListener('click', function () {
            reject('Dialog closed without selection');
            dialog.close();
            dialog.remove();
        });

    });
};


function scheduleClick(element, time) {
    var overlay = document.createElement('div');
    document.body.appendChild(overlay);
    var countDown = document.createElement('div');
    document.body.appendChild(countDown);

    let interval = setInterval(function () {
        if (time > new Date()) {
            // update count down

            var rect = element.getBoundingClientRect();

            overlay.style.position = 'absolute';
            overlay.style.border = '2px solid red';
            overlay.style.padding = '4px';
            overlay.style.width = `${rect.width}px`;
            overlay.style.height = `${rect.height}px`;
            overlay.style.left = `${rect.left + window.scrollX - 4}px`;
            overlay.style.top = `${rect.top + window.scrollY - 4}px`;
            overlay.style.zIndex = 10000;
            overlay.style.pointerEvents = 'none';

            countDown.style.backgroundColor = "red";
            countDown.style.color = "white";
            countDown.style.padding = '4px';
            countDown.style.position = 'absolute';
            countDown.style.left = overlay.style.left;
            countDown.style.top = `${rect.top + window.scrollY + rect.height - 4}px`;
            countDown.style.zIndex = 10000;            
            var differenceInMilliseconds = time.getTime() - (new Date()).getTime();
            var differenceInSeconds = Math.round(differenceInMilliseconds / 1000);
            if (differenceInSeconds > 60)
                countDown.innerText = "Click scheduled in " + Math.round((differenceInSeconds / 60)) + " minutes";
            else 
                countDown.innerText = "Click scheduled in " + differenceInSeconds + " seconds";
        }
        else {
            clearInterval(interval);
            element.click();
            countDown.innerText = "Clicked it!";            
        }

    }, 500);
}