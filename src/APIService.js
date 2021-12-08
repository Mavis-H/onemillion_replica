export default class APIService{

    static logIn(form_data){
      let formData = new FormData();
      formData.append('username', form_data['username']);
      formData.append('password', form_data['password']);
        return fetch('/login',{
            'method':'POST',
            'body' : formData

    })
    .then(response => response.json())
    .catch(error => console.log(error))
    }

    static logOut(){
        return fetch('/logout',{
            'method':'GET'})
            .then(response => response.json())
            .catch(error => console.log(error))
    }

    static signUp(form_data){
        let formData = new FormData();
        formData.append('username', form_data['username']);
        formData.append('password', form_data['password']);
        formData.append('confirm_password', form_data['confirm_password'])
        return fetch('/signup',{
            'method':'POST',
            'body' : formData
        })
            .then(response => response.json())
            .catch(error => console.log(error))
    }

    static getUserInfo(username) {
      return fetch(`/get_user?username=${username}`)
        .then(response => response.json())
        .catch(error => console.log(error))
    }


    static getPixelsListing(){
        return fetch('/pixels_listing')
            .then(response => response.json())
            .catch(error => console.log(error))
    }

    static getUserPixels(){
        return fetch('/get_user_pixels')
            .then(response => response.json())
            .catch(error => console.log(error))
    }

    static getPTB(){
        return fetch('/pending_transaction_book')
            .then(response => response.json())
            .catch(error => console.log(error))
    }

    static getCurrentUserInfo(){
        return fetch(`/get_user`)
            .then(response => response.json())
            .catch(error => console.log(error))
    }

    static getMatrix(){
        return fetch(`/matrix`)
            .then(response => response.text())
            .catch(error => console.log(error))
    }

    // Position in 0-9999999 int
    static getPixelDetail(position){
        return fetch(`/pixel_detail/${position}`)
            .then(response => response.json())
            .catch(error => console.log(error))
    }


    static confirmPurchase(form_data){
        let formData = new FormData();
        formData.append('position', form_data['position']);
        formData.append('transaction_hash', form_data['transaction_hash']);
        return fetch('/confirm_purchase',{
            'method':'POST',
            'body' : formData
        })
            .then(response => response.json())
            .catch(error => console.log(error))
    }

    static requestPurchase(form_data){
        let formData = new FormData();
        formData.append('position', form_data['position']);
        return fetch('/request_purchase',{
            'method':'POST',
            'body' : formData
        })
            .then(response => response.json())
            .catch(error => console.log(error))
    }

    static recallListing(form_data){
        let formData = new FormData();
        formData.append('position', form_data['position']);
        return fetch('/recall_listing',{
            'method':'POST',
            'body' : formData
        })
            .then(response => response.json())
            .catch(error => console.log(error))
    }

    static requestListing(form_data) {
        let formData = new FormData();
        formData.append('position', form_data['position']);
        formData.append('amount', form_data['amount']);
        formData.append('wallet_address', form_data['wallet_address']);
        return fetch('/request_listing', {
            'method':'POST',
            'body' : formData
        })
            .then(response => response.json())
            .catch(error => console.log(error))
    }

    static setPixel(form_data){
        let formData = new FormData();
        formData.append('position', form_data['position']);
        formData.append('r', form_data['r']);
        formData.append('g', form_data['g']);
        formData.append('b', form_data['b']);
        formData.append('description', form_data['description']);
        return fetch('/set_pixel',{
            'method':'POST',
            'body' : formData
        })
            .then(response => response.json())
            .catch(error => console.log(error))
    }


}
