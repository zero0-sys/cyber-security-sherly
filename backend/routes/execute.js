import express from 'express';
import { exec } from 'child_process';
import { promisify } from 'util';
import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';

const execAsync = promisify(exec);
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const router = express.Router();

// Temp directory for code execution
const TEMP_DIR = path.join(__dirname, '../temp-exec');

// Ensure temp directory exists
await fs.mkdir(TEMP_DIR, { recursive: true });

// Execute code endpoint with multi-language support
router.post('/code', async (req, res) => {
    try {
        const { code, language, filename } = req.body;

        if (!code || !language) {
            return res.status(400).json({ error: 'Code and language required' });
        }

        let command;
        let ext;
        let tempFile;

        // Determine command and file extension based on language
        switch (language.toLowerCase()) {
            case 'python':
                ext = 'py';
                tempFile = path.join(TEMP_DIR, filename || `script_${Date.now()}.py`);
                await fs.writeFile(tempFile, code);
                command = `python3 "${tempFile}"`;
                break;

            case 'javascript':
            case 'js':
                ext = 'js';
                tempFile = path.join(TEMP_DIR, filename || `script_${Date.now()}.js`);
                await fs.writeFile(tempFile, code);
                command = `node "${tempFile}"`;
                break;

            case 'typescript':
            case 'ts':
                ext = 'ts';
                tempFile = path.join(TEMP_DIR, filename || `script_${Date.now()}.ts`);
                await fs.writeFile(tempFile, code);
                command = `npx ts-node "${tempFile}"`;
                break;

            case 'c':
                ext = 'c';
                const cFile = path.join(TEMP_DIR, filename || `program_${Date.now()}.c`);
                const cOut = path.join(TEMP_DIR, `program_${Date.now()}`);
                await fs.writeFile(cFile, code);
                command = `gcc "${cFile}" -o "${cOut}" && "${cOut}"`;
                tempFile = cFile;
                break;

            case 'cpp':
            case 'c++':
                ext = 'cpp';
                const cppFile = path.join(TEMP_DIR, filename || `program_${Date.now()}.cpp`);
                const cppOut = path.join(TEMP_DIR, `program_${Date.now()}`);
                await fs.writeFile(cppFile, code);
                command = `g++ "${cppFile}" -o "${cppOut}" && "${cppOut}"`;
                tempFile = cppFile;
                break;

            case 'java':
                ext = 'java';
                const className = filename ? filename.replace('.java', '') : 'Main';
                const javaFile = path.join(TEMP_DIR, `${className}.java`);
                await fs.writeFile(javaFile, code);
                command = `javac "${javaFile}" && java -cp "${TEMP_DIR}" ${className}`;
                tempFile = javaFile;
                break;

            case 'go':
                ext = 'go';
                tempFile = path.join(TEMP_DIR, filename || `main_${Date.now()}.go`);
                await fs.writeFile(tempFile, code);
                command = `go run "${tempFile}"`;
                break;

            case 'rust':
                ext = 'rs';
                const rsFile = path.join(TEMP_DIR, filename || `main_${Date.now()}.rs`);
                const rsOut = path.join(TEMP_DIR, `program_${Date.now()}`);
                await fs.writeFile(rsFile, code);
                command = `rustc "${rsFile}" -o "${rsOut}" && "${rsOut}"`;
                tempFile = rsFile;
                break;

            case 'ruby':
                ext = 'rb';
                tempFile = path.join(TEMP_DIR, filename || `script_${Date.now()}.rb`);
                await fs.writeFile(tempFile, code);
                command = `ruby "${tempFile}"`;
                break;

            case 'php':
                ext = 'php';
                tempFile = path.join(TEMP_DIR, filename || `script_${Date.now()}.php`);
                await fs.writeFile(tempFile, code);
                command = `php "${tempFile}"`;
                break;

            case 'bash':
            case 'sh':
                ext = 'sh';
                tempFile = path.join(TEMP_DIR, filename || `script_${Date.now()}.sh`);
                await fs.writeFile(tempFile, code);
                await fs.chmod(tempFile, 0o755);
                command = `bash "${tempFile}"`;
                break;

            default:
                return res.status(400).json({
                    error: `Unsupported language: ${language}`,
                    supported: ['python', 'javascript', 'typescript', 'c', 'c++', 'java', 'go', 'rust', 'ruby', 'php', 'bash']
                });
        }

        // Execute with timeout
        const { stdout, stderr } = await execAsync(command, {
            timeout: 30000, // 30 second timeout
            cwd: TEMP_DIR
        });

        // Cleanup temp file
        try {
            if (tempFile) await fs.unlink(tempFile);
        } catch (e) {
            // Ignore cleanup errors
        }

        res.json({
            success: true,
            output: stdout,
            error: stderr,
            language,
            executedAt: new Date().toISOString()
        });

    } catch (error) {
        res.status(500).json({
            success: false,
            error: error.message,
            errorOutput: error.stderr || error.stdout
        });
    }
});

export default router;
