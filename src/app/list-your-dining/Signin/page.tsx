'use client';

import OrganizerLoginForm from '@/components/organizer/OrganizerLoginForm';

export default function SignupPage() {
    return (
        <OrganizerLoginForm
            vertical="dining"
            setupPath="/list-your-dining/setup"
            signinPath="/list-your-dining/Signin"
        />
    );
}
