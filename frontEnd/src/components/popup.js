export class Popup {

    constructor() {
        document.getElementById('popup-cansel').onclick = function (e) {
            Popup.hidePopup();
        }
    }

    static showPopup(){
        const popupContainer = document.getElementById('popup-container');
        popupContainer.classList.remove('d-none');
        popupContainer.classList.add('d-flex');
    }

    static addEventDelete(id, callbackDelete){
        document.getElementById('popup-delete').onclick = function (event) {
            callbackDelete(id);
        }
    }

    static hidePopup(){
        const popupContainer = document.getElementById('popup-container');
        popupContainer.classList.remove('d-flex');
        popupContainer.classList.add('d-none');
    }

    static async getPopup(title) {
        let res = await fetch('/templates/popup.html').then(response => response.text())
        let div = document.createElement('div');
        div.innerHTML = res;

        document.getElementById('container').append(div);
        new Popup();
        document.getElementById('popupTitle').innerText = title;
    }

}
