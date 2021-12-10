function Validator (formSelector,options) {
    if(!options) {
        options = {};
    }

    let formRules = {};
    let formGroup = '.form-group';
    let Formmessage = '.form-message';

    function getParent (element,selector) {
        while(element.parentElement) {
           if(element.parentElement.matches(selector)){
               return element.parentElement
           }
        }
        element = element.parentElement

    }

    /**
     * Quy ước tạo rules:
     * -Nếu có lỗi return `error message`
     * - nếu không có lỗi thì trả về undefined
     */ 
    let validatorRules = {
        required: function(value){
            return value.trim() ? undefined : 'Vui lòng nhập trường này'
        },
        email: function(value) {
            let regex =/^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/;
            return regex.test(value) ? undefined : 'Vui lòng nhập đúng email'
        },
        min: function(min) {
            return function(value){
                return value.length >= min ? undefined : `Vui lòng nhập tối thiểu ${min} ký tự`
            }
        }

    }
    
    //lấy ra form element trong DOM theo formSelector
    let formElement = document.querySelector(formSelector);

    if(formElement){

        let inputs = formElement.querySelectorAll('[name][rules]')
        for (let input of inputs) {

            let ruleInfo
            let rules = input.getAttribute('rules').split('|')

            for(let rule of rules) {
                let isRuleHasValue = rule.includes(':')

                if(isRuleHasValue) 
                {
                    ruleInfo = rule.split(':')

                    rule = ruleInfo[0]
                }

                let ruleFunc = validatorRules[rule];

                if(isRuleHasValue) {
                    ruleFunc = validatorRules[rule](ruleInfo[1])
                }

                if(!Array.isArray(formRules[input.name])){
                    formRules[input.name] = []
                }
                formRules[input.name].push(ruleFunc)
                
            }

            //lắng nghe sự kiện (blur input...)

            input.onblur = handleValidate;
            input.oninput = handleClearerror;

        }

        // hàm thực hiện validate
        function handleValidate(event) {
            let rules = formRules[event.target.name]
            let errorMessage
            rules.find(rule => {
                errorMessage = rule(event.target.value)
                return errorMessage
            });
            // nếu có lỗi thi hiên thị message lỗi
            let formgroup = getParent(event.target,formGroup)
            
            if(errorMessage) {
                if(!formgroup) return;

                let errorElement = formgroup.querySelector(Formmessage)
                if(errorElement) {
                    errorElement.innerText = errorMessage;
                    getParent(event.target,formGroup).classList.add('invalid')
                }

            }
            return !errorMessage

        }
        //hàm thực hiên handleClearerror
        function handleClearerror (event) {
            let formgroup = getParent(event.target,formGroup)
            if(formgroup.classList.contains('invalid')) {
                getParent(event.target,formGroup).classList.remove('invalid')

                let errorElement = formgroup.querySelector(Formmessage)
                if(errorElement) {
                    errorElement.innerText = '';
                }
            }
        } 
    }
    formElement.onsubmit = function(event) {
        event.preventDefault();

        let inputs = formElement.querySelectorAll('[name][rules]')
        let isValid = true;

        for (let input of inputs) {
            if(!handleValidate({ target : input})) {
                isValid = false;
            }
        }
        
        // khi không có lỗi thì submit form
        if(isValid) {
            if(typeof options.onsubmit === 'function'){

                var enableInput = formElement.querySelectorAll('[name]:not([disabled])')// lấy ra tất cả thẻ input có attribute name và không có disabled
                var formValues = Array.from(enableInput).reduce(function(values,input){
                switch(input.type){
                    case 'radio':// lấy ra value của radio
                        values[input.name] = formElement.querySelector('input[name = "'+ input.name + '"]:checked').value;// nhắm thẳng đến thẻ input đang đc check để lấy ra value
                        break;
                    case 'checkbox':// lấy ra tất cả value của checked
                        if(!input.matches(':checked')) {// kiểm tra xem checkbox có được checked k nếu không trả ra value rỗng
                            values[input.name] = '';
                            return values
                        };

                        if(!Array.isArray(values[input.name])){
                            values[input.name] = [];
                        }
                        values[input.name].push(input.value)
                        break;
                    case 'file':
                        values[input.name] = input.files;// với ảnh thi lấy dữ liệu là dạng file chứ không lấy đương dẫn
                        break;
                    default:
                        values[input.name] = input.value;
                }

                return  values
            },{})

                options.onsubmit(formValues)
            }else {
                formElement.submit();
            }
            
        }
    }
}