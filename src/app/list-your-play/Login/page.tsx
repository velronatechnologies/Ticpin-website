'use client';

import OrganizerLoginForm from '@/components/organizer/OrganizerLoginForm';

export default function LoginPage() {
    return (
        <OrganizerLoginForm
            vertical="play"
            setupPath="/list-your-play/setup"
            signinPath="/list-your-play/Signin"
        />
    );
}
