import React, { useState } from 'react';
import CryptoJS from 'crypto-js';
import { Lock, Unlock, Hash, Key, Copy, Check, AlertCircle, ChevronDown, ChevronRight, Code, FileCode, Shield } from 'lucide-react';

const CryptoLab: React.FC = () => {
    // Accordion State
    const [expandedSection, setExpandedSection] = useState<string | null>('encrypt');

    const toggleSection = (section: string) => {
        setExpandedSection(expandedSection === section ? null : section);
    };

    // Global Input/Output State
    const [input, setInput] = useState('');
    const [output, setOutput] = useState('');
    const [key, setKey] = useState('mysecretkey123');
    const [copied, setCopied] = useState(false);
    const [error, setError] = useState('');

    // JWT Generator State
    const [jwtAlgorithm, setJwtAlgorithm] = useState<'HS256' | 'HS384' | 'HS512'>('HS256');
    const [jwtKeyLength, setJwtKeyLength] = useState(256);
    const [jwtSecretKey, setJwtSecretKey] = useState('');
    const [jwtCopied, setJwtCopied] = useState(false);

    const handleCopy = () => {
        navigator.clipboard.writeText(output);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    // --- CRYPTO LOGIC (Keep existing logic) ---

    // ENCRYPTION FUNCTIONS
    const encryptAES = () => { try { setOutput(CryptoJS.AES.encrypt(input, key).toString()); setError(''); } catch (e: any) { setError(`Encryption failed: ${e.message}`); } };
    const decryptAES = () => { try { setOutput(CryptoJS.AES.decrypt(input, key).toString(CryptoJS.enc.Utf8) || 'Decryption failed'); setError(''); } catch (e: any) { setError(`Decryption failed: ${e.message}`); } };
    const encryptTripleDES = () => { try { setOutput(CryptoJS.TripleDES.encrypt(input, key).toString()); setError(''); } catch (e: any) { setError(`Encryption failed: ${e.message}`); } };
    const decryptTripleDES = () => { try { setOutput(CryptoJS.TripleDES.decrypt(input, key).toString(CryptoJS.enc.Utf8) || 'Decryption failed'); setError(''); } catch (e: any) { setError(`Decryption failed: ${e.message}`); } };
    const encryptRC4 = () => { try { setOutput(CryptoJS.RC4.encrypt(input, key).toString()); setError(''); } catch (e: any) { setError(`Encryption failed: ${e.message}`); } };
    const decryptRC4 = () => { try { setOutput(CryptoJS.RC4.decrypt(input, key).toString(CryptoJS.enc.Utf8) || 'Decryption failed'); setError(''); } catch (e: any) { setError(`Decryption failed: ${e.message}`); } };
    const encryptRabbit = () => { try { setOutput(CryptoJS.Rabbit.encrypt(input, key).toString()); setError(''); } catch (e: any) { setError(`Encryption failed: ${e.message}`); } };
    const decryptRabbit = () => { try { setOutput(CryptoJS.Rabbit.decrypt(input, key).toString(CryptoJS.enc.Utf8) || 'Decryption failed'); setError(''); } catch (e: any) { setError(`Decryption failed: ${e.message}`); } };

    // ENCODING FUNCTIONS
    const encodeBase64 = () => { setOutput(CryptoJS.enc.Base64.stringify(CryptoJS.enc.Utf8.parse(input))); setError(''); };
    const decodeBase64 = () => { try { setOutput(CryptoJS.enc.Base64.parse(input).toString(CryptoJS.enc.Utf8)); setError(''); } catch (e: any) { setError(`Decoding failed: ${e.message}`); } };
    const encodeHex = () => { setOutput(CryptoJS.enc.Hex.stringify(CryptoJS.enc.Utf8.parse(input))); setError(''); };
    const decodeHex = () => { try { setOutput(CryptoJS.enc.Hex.parse(input).toString(CryptoJS.enc.Utf8)); setError(''); } catch (e: any) { setError(`Decoding failed: ${e.message}`); } };
    const encodeBinary = () => { setOutput(input.split('').map(c => c.charCodeAt(0).toString(2).padStart(8, '0')).join(' ')); setError(''); };
    const decodeBinary = () => { try { setOutput(input.split(' ').map(b => String.fromCharCode(parseInt(b, 2))).join('')); setError(''); } catch (e: any) { setError(`Decoding failed: ${e.message}`); } };
    const encodeURL = () => { setOutput(encodeURIComponent(input)); setError(''); };
    const decodeURL = () => { try { setOutput(decodeURIComponent(input)); setError(''); } catch (e: any) { setError(`Decoding failed: ${e.message}`); } };
    const encodeHTML = () => { setOutput(input.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;').replace(/'/g, '&#39;')); setError(''); };
    const rot13 = () => { setOutput(input.replace(/[a-zA-Z]/g, c => String.fromCharCode((c.charCodeAt(0) - (c <= 'Z' ? 65 : 97) + 13) % 26 + (c <= 'Z' ? 65 : 97)))); setError(''); };
    const caesarCipher = (shift: number) => { setOutput(input.replace(/[a-zA-Z]/g, c => String.fromCharCode((c.charCodeAt(0) - (c <= 'Z' ? 65 : 97) + shift) % 26 + (c <= 'Z' ? 65 : 97)))); setError(''); };

    // HASHING FUNCTIONS
    const hashMD5 = () => { setOutput(CryptoJS.MD5(input).toString()); setError(''); };
    const hashSHA1 = () => { setOutput(CryptoJS.SHA1(input).toString()); setError(''); };
    const hashSHA256 = () => { setOutput(CryptoJS.SHA256(input).toString()); setError(''); };
    const hashSHA512 = () => { setOutput(CryptoJS.SHA512(input).toString()); setError(''); };
    const hashSHA3 = () => { setOutput(CryptoJS.SHA3(input).toString()); setError(''); };
    const hashRIPEMD160 = () => { setOutput(CryptoJS.RIPEMD160(input).toString()); setError(''); };

    // MODERN FUNCTIONS
    const generateHMAC = () => { setOutput(CryptoJS.HmacSHA256(input, key).toString()); setError(''); };
    const generatePBKDF2 = () => { setOutput(CryptoJS.PBKDF2(input, key, { keySize: 256 / 32, iterations: 1000 }).toString()); setError(''); };

    // CONVERTERS
    const atbashCipher = () => { setOutput(input.replace(/[a-zA-Z]/g, c => String.fromCharCode((c <= 'Z' ? 65 : 97) + (25 - (c.charCodeAt(0) - (c <= 'Z' ? 65 : 97)))))); setError(''); };
    const reverseString = () => { setOutput(input.split('').reverse().join('')); setError(''); };
    const toUpperCase = () => { setOutput(input.toUpperCase()); setError(''); };
    const toLowerCase = () => { setOutput(input.toLowerCase()); setError(''); };
    const unicodeEscape = () => { setOutput(input.split('').map(c => '\\u' + c.charCodeAt(0).toString(16).padStart(4, '0')).join('')); setError(''); };
    const jsonBeautify = () => { try { setOutput(JSON.stringify(JSON.parse(input), null, 2)); setError(''); } catch (e: any) { setError(`Invalid JSON: ${e.message}`); } };
    const jsonMinify = () => { try { setOutput(JSON.stringify(JSON.parse(input))); setError(''); } catch (e: any) { setError(`Invalid JSON: ${e.message}`); } };

    // JWT FUNCTIONS (Keep existing logic)
    const generateJWTSecret = () => {
        const length = jwtKeyLength / 8;
        const randomBytes = CryptoJS.lib.WordArray.random(length);
        const secretKey = randomBytes.toString(CryptoJS.enc.Hex);
        setJwtSecretKey(secretKey);
    };

    const copyJWTSecret = () => {
        navigator.clipboard.writeText(jwtSecretKey);
        setJwtCopied(true);
        setTimeout(() => setJwtCopied(false), 2000);
    };

    const getKeyStrength = (length: number): { label: string, color: string, percentage: number } => {
        if (length >= 512) return { label: 'Maximum Security', color: 'text-green-500', percentage: 100 };
        if (length >= 384) return { label: 'Very Strong', color: 'text-green-400', percentage: 85 };
        if (length >= 256) return { label: 'Strong', color: 'text-blue-400', percentage: 70 };
        if (length >= 128) return { label: 'Moderate', color: 'text-yellow-400', percentage: 50 };
        return { label: 'Weak', color: 'text-red-400', percentage: 30 };
    };


    return (
        <div className="flex flex-col h-full bg-black">
            {/* Header */}
            <div className="p-4 border-b border-green-900 shrink-0">
                <div className="flex items-center gap-3">
                    <div className="p-2 bg-green-900/20 rounded border border-green-500/50">
                        <Key size={20} className="text-green-500" />
                    </div>
                    <div>
                        <h2 className="font-orbitron font-bold text-white text-xl">CRYPTOGRAPHY LAB</h2>
                        <p className="text-xs text-gray-500 font-mono">Advanced Algo Suite v2.0</p>
                    </div>
                </div>
            </div>

            {/* Main Content - Scrollable */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4">

                {/* Global Inputs (Sticky-ish feel by being top of scroll) */}
                <div className="space-y-4">
                    {/* Key Input (Always visible but optional) */}
                    <div>
                        <label className="text-xs text-green-500/70 font-bold mb-1 block flex items-center gap-2">
                            <Key size={12} /> SECRET KEY (Optional)
                        </label>
                        <input
                            type="text"
                            value={key}
                            onChange={(e) => setKey(e.target.value)}
                            className="w-full bg-black border border-green-900 rounded px-3 py-2 text-green-400 font-mono text-xs focus:border-green-500 focus:outline-none placeholder-green-900"
                            placeholder="Enter encryption key..."
                        />
                    </div>

                    {/* Input Textarea */}
                    <div>
                        <label className="text-xs text-green-500/70 font-bold mb-1 block flex items-center gap-2">
                            <Code size={12} /> INPUT DATA
                        </label>
                        <textarea
                            value={input}
                            onChange={(e) => setInput(e.target.value)}
                            className="w-full h-24 bg-black border border-green-900 rounded p-3 text-green-400 font-mono text-sm resize-none focus:border-green-500 focus:outline-none placeholder-green-900"
                            placeholder="Enter text to process..."
                        />
                    </div>
                </div>

                {/* Error Message */}
                {error && (
                    <div className="bg-red-900/10 border border-red-500/50 rounded p-2 flex items-center gap-2 text-red-400 text-xs">
                        <AlertCircle size={14} />
                        {error}
                    </div>
                )}

                {/* ACCORDION SECTIONS */}
                <div className="space-y-2">

                    {/* 1. Encryption */}
                    <AccordionSection
                        title="Encryption Algorithms"
                        icon={<Lock size={16} />}
                        isOpen={expandedSection === 'encrypt'}
                        onToggle={() => toggleSection('encrypt')}
                    >
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                            <ActionButton icon={<Lock size={14} />} label="AES Encrypt" onClick={encryptAES} />
                            <ActionButton icon={<Unlock size={14} />} label="AES Decrypt" onClick={decryptAES} variant="secondary" />
                            <ActionButton icon={<Lock size={14} />} label="3DES Encrypt" onClick={encryptTripleDES} />
                            <ActionButton icon={<Unlock size={14} />} label="3DES Decrypt" onClick={decryptTripleDES} variant="secondary" />
                            <ActionButton icon={<Lock size={14} />} label="RC4 Encrypt" onClick={encryptRC4} />
                            <ActionButton icon={<Unlock size={14} />} label="RC4 Decrypt" onClick={decryptRC4} variant="secondary" />
                            <ActionButton icon={<Lock size={14} />} label="Rabbit Encrypt" onClick={encryptRabbit} />
                            <ActionButton icon={<Unlock size={14} />} label="Rabbit Decrypt" onClick={decryptRabbit} variant="secondary" />
                        </div>
                    </AccordionSection>

                    {/* 2. Encoding */}
                    <AccordionSection
                        title="Encoding / Decoding"
                        icon={<FileCode size={16} />}
                        isOpen={expandedSection === 'encode'}
                        onToggle={() => toggleSection('encode')}
                    >
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                            <ActionButton icon={<Code size={14} />} label="Base64 Gen" onClick={encodeBase64} />
                            <ActionButton icon={<Code size={14} />} label="Base64 Dec" onClick={decodeBase64} variant="secondary" />
                            <ActionButton icon={<Code size={14} />} label="Hex Gen" onClick={encodeHex} />
                            <ActionButton icon={<Code size={14} />} label="Hex Dec" onClick={decodeHex} variant="secondary" />
                            <ActionButton icon={<Code size={14} />} label="Binary Gen" onClick={encodeBinary} />
                            <ActionButton icon={<Code size={14} />} label="Binary Dec" onClick={decodeBinary} variant="secondary" />
                            <ActionButton icon={<Code size={14} />} label="URL Enc" onClick={encodeURL} />
                            <ActionButton icon={<Code size={14} />} label="URL Dec" onClick={decodeURL} variant="secondary" />
                            <ActionButton icon={<Code size={14} />} label="HTML Enc" onClick={encodeHTML} />
                            <ActionButton icon={<Code size={14} />} label="ROT13" onClick={rot13} />
                            <ActionButton icon={<Code size={14} />} label="Caesar +3" onClick={() => caesarCipher(3)} />
                            <ActionButton icon={<Code size={14} />} label="Caesar -3" onClick={() => caesarCipher(-3)} variant="secondary" />
                        </div>
                    </AccordionSection>

                    {/* 3. Hashing */}
                    <AccordionSection
                        title="Hashing Algorithms"
                        icon={<Hash size={16} />}
                        isOpen={expandedSection === 'hash'}
                        onToggle={() => toggleSection('hash')}
                    >
                        <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                            <ActionButton icon={<Hash size={14} />} label="MD5" onClick={hashMD5} />
                            <ActionButton icon={<Hash size={14} />} label="SHA-1" onClick={hashSHA1} />
                            <ActionButton icon={<Hash size={14} />} label="SHA-256" onClick={hashSHA256} />
                            <ActionButton icon={<Hash size={14} />} label="SHA-512" onClick={hashSHA512} />
                            <ActionButton icon={<Hash size={14} />} label="SHA-3" onClick={hashSHA3} />
                            <ActionButton icon={<Hash size={14} />} label="RIPEMD-160" onClick={hashRIPEMD160} />
                        </div>
                    </AccordionSection>

                    {/* 4. Modern */}
                    <AccordionSection
                        title="Modern Cryptography"
                        icon={<Shield size={16} />}
                        isOpen={expandedSection === 'modern'}
                        onToggle={() => toggleSection('modern')}
                    >
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                            <ActionButton icon={<Key size={14} />} label="HMAC-SHA256 (Uses Key)" onClick={generateHMAC} />
                            <ActionButton icon={<Key size={14} />} label="PBKDF2 Key Derivation" onClick={generatePBKDF2} />
                        </div>
                    </AccordionSection>

                    {/* 5. Converters */}
                    <AccordionSection
                        title="Text Converters"
                        icon={<Code size={16} />}
                        isOpen={expandedSection === 'converter'}
                        onToggle={() => toggleSection('converter')}
                    >
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                            <ActionButton icon={<Code size={14} />} label="Reverse" onClick={reverseString} />
                            <ActionButton icon={<Code size={14} />} label="UPPERCASE" onClick={toUpperCase} />
                            <ActionButton icon={<Code size={14} />} label="lowercase" onClick={toLowerCase} />
                            <ActionButton icon={<Code size={14} />} label="JSON Pretty" onClick={jsonBeautify} />
                            <ActionButton icon={<Code size={14} />} label="JSON Minify" onClick={jsonMinify} variant="secondary" />
                            <ActionButton icon={<Code size={14} />} label="Atbash" onClick={atbashCipher} />
                            <ActionButton icon={<Code size={14} />} label="Unicode" onClick={unicodeEscape} />
                        </div>
                    </AccordionSection>

                    {/* 6. JWT Generator (Custom UI) */}
                    <AccordionSection
                        title="JWT Token Generator"
                        icon={<Shield size={16} />}
                        isOpen={expandedSection === 'jwt'}
                        onToggle={() => toggleSection('jwt')}
                    >
                        <div className="space-y-4">
                            {/* Algorithm & Key Length */}
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                    <label className="text-[10px] text-gray-500 font-bold mb-1 block">ALGORITHM</label>
                                    <div className="flex gap-1">
                                        {(['HS256', 'HS384', 'HS512'] as const).map((algo) => (
                                            <button key={algo} onClick={() => { setJwtAlgorithm(algo); setJwtKeyLength(algo === 'HS256' ? 256 : algo === 'HS384' ? 384 : 512); }}
                                                className={`flex-1 py-1 rounded text-xs border ${jwtAlgorithm === algo ? 'bg-green-600 border-green-500 text-black font-bold' : 'bg-black border-gray-800 text-gray-400'}`}>
                                                {algo}
                                            </button>
                                        ))}
                                    </div>
                                </div>
                                <div>
                                    <label className="text-[10px] text-gray-500 font-bold mb-1 block">KEY LENGTH (BITS)</label>
                                    <div className="flex gap-1 overflow-x-auto">
                                        {[256, 384, 512].map((length) => (
                                            <button key={length} onClick={() => setJwtKeyLength(length)}
                                                className={`flex-1 py-1 px-2 rounded text-xs border ${jwtKeyLength === length ? 'bg-blue-600 border-blue-500 text-black font-bold' : 'bg-black border-gray-800 text-gray-400'}`}>
                                                {length}
                                            </button>
                                        ))}
                                    </div>
                                </div>
                            </div>

                            <button onClick={generateJWTSecret} className="w-full bg-green-900/30 hover:bg-green-500/20 text-green-400 border border-green-500/50 py-2 rounded font-mono text-xs font-bold transition-all">
                                GENERATE SECRET KEY
                            </button>

                            {jwtSecretKey && (
                                <div className="bg-black border border-green-900 rounded p-2 relative group">
                                    <code className="text-green-500 font-mono text-xs break-all block pr-8">{jwtSecretKey}</code>
                                    <button onClick={copyJWTSecret} className="absolute top-2 right-2 text-gray-500 hover:text-white">
                                        {jwtCopied ? <Check size={12} /> : <Copy size={12} />}
                                    </button>
                                </div>
                            )}
                        </div>
                    </AccordionSection>

                </div>

                {/* Output Textarea (Sticky at bottomish) */}
                <div className="pt-2">
                    <div className="flex items-center justify-between mb-1">
                        <label className="text-xs text-green-500/70 font-bold flex items-center gap-2">
                            <Code size={12} /> OUTPUT RESULT
                        </label>
                        {output && (
                            <button onClick={handleCopy} className="text-[10px] text-green-500 hover:text-white flex items-center gap-1">
                                {copied ? <Check size={10} /> : <Copy size={10} />} {copied ? 'COPIED' : 'COPY'}
                            </button>
                        )}
                    </div>
                    <textarea
                        value={output}
                        readOnly
                        className="w-full h-24 bg-black border border-green-900/50 rounded p-3 text-green-400 font-mono text-sm resize-none focus:border-green-500 focus:outline-none placeholder-green-900/50"
                        placeholder="Result will appear here..."
                    />
                </div>
            </div>
        </div>
    );
};

// Sub-components

const AccordionSection: React.FC<{ title: string, icon: React.ReactNode, isOpen: boolean, onToggle: () => void, children: React.ReactNode }> = ({
    title, icon, isOpen, onToggle, children
}) => (
    <div className={`border ${isOpen ? 'border-green-500/50 bg-green-900/10' : 'border-green-900/30 bg-black'} rounded transition-all duration-200`}>
        <button
            onClick={onToggle}
            className="w-full flex items-center justify-between p-3 hover:bg-green-900/20 transition-colors text-left"
        >
            <div className="flex items-center gap-2 text-green-400 font-bold font-orbitron text-sm">
                {icon}
                <span>{title}</span>
            </div>
            {isOpen ? <ChevronDown size={16} className="text-green-500" /> : <ChevronRight size={16} className="text-gray-600" />}
        </button>

        {isOpen && (
            <div className="p-3 border-t border-green-900/30 animate-in slide-in-from-top-2 duration-200">
                {children}
            </div>
        )}
    </div>
);

const ActionButton: React.FC<{ icon: React.ReactNode; label: string; onClick: () => void; variant?: 'primary' | 'secondary' }> = ({
    icon, label, onClick, variant = 'primary'
}) => (
    <button
        onClick={onClick}
        className={`flex flex-col items-center justify-center gap-1 p-2 rounded text-[10px] font-bold transition-all border ${variant === 'primary'
                ? 'bg-green-950/30 text-green-400 border-green-900 hover:border-green-500 hover:bg-green-900/30'
                : 'bg-blue-950/30 text-blue-400 border-blue-900 hover:border-blue-500 hover:bg-blue-900/30'
            }`}
    >
        {icon}
        <span>{label}</span>
    </button>
);

export default CryptoLab;