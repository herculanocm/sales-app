import { AbstractControl, ValidationErrors, ValidatorFn } from "@angular/forms";

export const passwordMatchValidator: ValidatorFn = (
    control: AbstractControl
): ValidationErrors | null => {
    const password = control.get('password') as AbstractControl;
    const newPassword = control.get('password2') as AbstractControl;

    if (password && newPassword && password.value !== newPassword.value) {
        return { passwordMismatch: true };
    }

    return null;
};

export const passwordFormatValidator: ValidatorFn = (
    control: AbstractControl
): ValidationErrors | null => {
    const newPassword = control.get('password2') as AbstractControl;

    // Password must contain at least one letter, one number, and one special character
    const containsLetter = /[a-zA-Z]/.test(newPassword.value);
    const containsNumber = /\d/.test(newPassword.value);
    const containsSpecialCharacter = /[!@#$%^&*()_+{}[\]:;<>,.?~\\/-]/.test(newPassword.value);

    // console.log('containsLetter:', containsLetter);
    // console.log('containsNumber:', containsNumber);
    // console.log('containsSpecialCharacter:', containsSpecialCharacter);


    if (!containsLetter || !containsNumber || !containsSpecialCharacter) {
        return { passwordFormat: true };
    }

    return null;
};