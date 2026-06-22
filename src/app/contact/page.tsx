'use cache';

import { cacheLife, cacheTag } from 'next/cache';
import ContactClient from './ContactClient';

export default async function ContactPage() {
    cacheLife('days');
    cacheTag('contact-page');

    return <ContactClient />;
}