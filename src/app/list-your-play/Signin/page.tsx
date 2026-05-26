'use client';

import OrganizerSigninForm from '@/components/organizer/OrganizerSigninForm';

export default function SignupPage() {
    return (
        <OrganizerSigninForm
            vertical="play"
            setupPath="/list-your-play/setup"
            loginPath="/list-your-play/Login"
        />
    );
}
