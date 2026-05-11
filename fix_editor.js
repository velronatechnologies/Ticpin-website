const fs = require('fs');
const path = 'src/app/play/create/page.tsx';
let content = fs.readFileSync(path, 'utf8');

// 1. In useEffect for auth, add initialization of editorRef from Zustand description
content = content.replace(
    /checkAuth\(\);/,
    `checkAuth();
        
        // Initialize rich text editor from Zustand store
        if (editorRef.current && description) {
            editorRef.current.innerHTML = description;
            setHasContent(true);
        }`
);

// 2. In handleSubmit, save description to Zustand
content = content.replace(
    /const venueData = \{/,
    `setField('description', editorRef.current?.innerHTML ?? '');
        
        const venueData = {`
);

fs.writeFileSync(path, content, 'utf8');
console.log('Fixed editor persistence');
