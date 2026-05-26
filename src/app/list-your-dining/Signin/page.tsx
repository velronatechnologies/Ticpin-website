'use client';

import OrganizerSigninForm from '@/components/organizer/OrganizerSigninForm';

export default function SignupPage() {
    return (
        <OrganizerSigninForm
            vertical="dining"
            setupPath="/list-your-dining/setup"
            loginPath="/list-your-dining/Login"
            signinTitle="Create Business account"
        />
    );
}
