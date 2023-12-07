export default function validateInfo(values){
    let errors = {}

    if(!values.username.trim()){
        errors.username = 'Username is riquered'
    }

    if (!values.email) {
        errors.email = 'Email is requered'
    }else if (!/^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i.test(values.email)){
        errors.email = 'Email address is invalid'
    }

    if (!values.password) {
        errors.password = 'Password is requered'
    } else if (values.password.length < 6){
        errors.password = 'Password need to be at least 6 characters or more'
    }

    if (!values.password2) {
        errors.password2 = 'Password2 is requered'
    } else if (values.password2 !== values.password){
        errors.password2 = 'Passwords do not match'
    }

    return errors;
} 

