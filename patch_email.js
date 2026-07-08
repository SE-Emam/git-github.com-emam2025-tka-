const fs = require('fs');
let code = fs.readFileSync('src/pages/Login.tsx', 'utf8');

code = code.replace(/const handleEmailLogin = async \([^)]*\) => {[\s\S]*?};\n\n  const handleStudentLogin/m, 
`const handleEmailLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const result = await loginWithEmailLocally(email, password);
      login(result.user.uid);
    } catch (err: any) {
      setError(err.message || 'Failed to sign in. Check your credentials.');
      setLoading(false);
    }
  };

  const handleStudentLogin`);

fs.writeFileSync('src/pages/Login.tsx', code);
