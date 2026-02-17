import React, { useState } from 'react';
import CryptoJS from 'crypto-js';
import { Lock, Unlock, Hash, Key, Copy, Check, AlertCircle } from 'lucide-react';

type TabType = 'encrypt' | 'encode' | 'hash' | 'modern' | 'converter' | 'jwt';

const CryptoLab: React.FC = () => {
    const [activeTab, setActiveTab] = useState<TabType>('encrypt');
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

    // ENCRYPTION FUNCTIONS
    const encryptAES = () => {
        try {
            const encrypted = CryptoJS.AES.encrypt(input, key).toString();
            setOutput(encrypted);
            setError('');
        } catch (e: any) {
            setError(`Encryption failed: ${e.message}`);
        }
    };

    const decryptAES = () => {
        try {
            const decrypted = CryptoJS.AES.decrypt(input, key).toString(CryptoJS.enc.Utf8);
            setOutput(decrypted || 'Decryption failed - check key');
            setError('');
        } catch (e: any) {
            setError(`Decryption failed: ${e.message}`);
        }
    };

    const encryptTripleDES = () => {
        try {
            const encrypted = CryptoJS.TripleDES.encrypt(input, key).toString();
            setOutput(encrypted);
            setError('');
        } catch (e: any) {
            setError(`Encryption failed: ${e.message}`);
        }
    };

    const decryptTripleDES = () => {
        try {
            const decrypted = CryptoJS.TripleDES.decrypt(input, key).toString(CryptoJS.enc.Utf8);
            setOutput(decrypted || 'Decryption failed - check key');
            setError('');
        } catch (e: any) {
            setError(`Decryption failed: ${e.message}`);
        }
    };

    const encryptRC4 = () => {
        try {
            const encrypted = CryptoJS.RC4.encrypt(input, key).toString();
            setOutput(encrypted);
            setError('');
        } catch (e: any) {
            setError(`Encryption failed: ${e.message}`);
        }
    };

    const decryptRC4 = () => {
        try {
            const decrypted = CryptoJS.RC4.decrypt(input, key).toString(CryptoJS.enc.Utf8);
            setOutput(decrypted || 'Decryption failed - check key');
            setError('');
        } catch (e: any) {
            setError(`Decryption failed: ${e.message}`);
        }
    };

    const encryptRabbit = () => {
        try {
            const encrypted = CryptoJS.Rabbit.encrypt(input, key).toString();
            setOutput(encrypted);
            setError('');
        } catch (e: any) {
            setError(`Encryption failed: ${e.message}`);
        }
    };

    const decryptRabbit = () => {
        try {
            const decrypted = CryptoJS.Rabbit.decrypt(input, key).toString(CryptoJS.enc.Utf8);
            setOutput(decrypted || 'Decryption failed - check key');
            setError('');
        } catch (e: any) {
            setError(`Decryption failed: ${e.message}`);
        }
    };

    // ENCODING FUNCTIONS
    const encodeBase64 = () => {
        const encoded = CryptoJS.enc.Base64.stringify(CryptoJS.enc.Utf8.parse(input));
        setOutput(encoded);
        setError('');
    };

    const decodeBase64 = () => {
        try {
            const decoded = CryptoJS.enc.Base64.parse(input).toString(CryptoJS.enc.Utf8);
            setOutput(decoded);
            setError('');
        } catch (e: any) {
            setError(`Decoding failed: ${e.message}`);
        }
    };

    const encodeHex = () => {
        const encoded = CryptoJS.enc.Hex.stringify(CryptoJS.enc.Utf8.parse(input));
        setOutput(encoded);
        setError('');
    };

    const decodeHex = () => {
        try {
            const decoded = CryptoJS.enc.Hex.parse(input).toString(CryptoJS.enc.Utf8);
            setOutput(decoded);
            setError('');
        } catch (e: any) {
            setError(`Decoding failed: ${e.message}`);
        }
    };

    const encodeBinary = () => {
        const binary = input.split('').map(char =>
            char.charCodeAt(0).toString(2).padStart(8, '0')
        ).join(' ');
        setOutput(binary);
        setError('');
    };

    const decodeBinary = () => {
        try {
            const decoded = input.split(' ').map(bin =>
                String.fromCharCode(parseInt(bin, 2))
            ).join('');
            setOutput(decoded);
            setError('');
        } catch (e: any) {
            setError(`Decoding failed: ${e.message}`);
        }
    };

    const encodeURL = () => {
        const encoded = encodeURIComponent(input);
        setOutput(encoded);
        setError('');
    };

    const decodeURL = () => {
        try {
            const decoded = decodeURIComponent(input);
            setOutput(decoded);
            setError('');
        } catch (e: any) {
            setError(`Decoding failed: ${e.message}`);
        }
    };

    const encodeHTML = () => {
        const encoded = input
            .replace(/&/g, '&amp;')
            .replace(/</g, '&lt;')
            .replace(/>/g, '&gt;')
            .replace(/"/g, '&quot;')
            .replace(/'/g, '&#39;');
        setOutput(encoded);
        setError('');
    };

    const rot13 = () => {
        const result = input.replace(/[a-zA-Z]/g, char => {
            const start = char <= 'Z' ? 65 : 97;
            return String.fromCharCode((char.charCodeAt(0) - start + 13) % 26 + start);
        });
        setOutput(result);
        setError('');
    };

    const caesarCipher = (shift: number) => {
        const result = input.replace(/[a-zA-Z]/g, char => {
            const start = char <= 'Z' ? 65 : 97;
            return String.fromCharCode((char.charCodeAt(0) - start + shift) % 26 + start);
        });
        setOutput(result);
        setError('');
    };

    // ADDITIONAL CONVERTERS
    const atbashCipher = () => {
        const result = input.replace(/[a-zA-Z]/g, char => {
            const isUpper = char <= 'Z';
            const start = isUpper ? 65 : 97;
            const offset = char.charCodeAt(0) - start;
            return String.fromCharCode(start + (25 - offset));
        });
        setOutput(result);
        setError('');
    };

    const morseEncode = () => {
        const morseCode: { [key: string]: string } = {
            'A': '.-', 'B': '-...', 'C': '-.-.', 'D': '-..', 'E': '.', 'F': '..-.',
            'G': '--.', 'H': '....', 'I': '..', 'J': '.---', 'K': '-.-', 'L': '.-..',
            'M': '--', 'N': '-.', 'O': '---', 'P': '.--.', 'Q': '--.-', 'R': '.-.',
            'S': '...', 'T': '-', 'U': '..-', 'V': '...-', 'W': '.--', 'X': '-..-',
            'Y': '-.--', 'Z': '--..', '0': '-----', '1': '.----', '2': '..---',
            '3': '...--', '4': '....-', '5': '.....', '6': '-....', '7': '--...',
            '8': '---..', '9': '----.', ' ': '/'
        };
        const result = input.toUpperCase().split('').map(char => morseCode[char] || char).join(' ');
        setOutput(result);
        setError('');
    };

    const morseDecode = () => {
        const morseReverse: { [key: string]: string } = {
            '.-': 'A', '-...': 'B', '-.-.': 'C', '-..': 'D', '.': 'E', '..-.': 'F',
            '--.': 'G', '....': 'H', '..': 'I', '.---': 'J', '-.-': 'K', '.-..': 'L',
            '--': 'M', '-.': 'N', '---': 'O', '.--.': 'P', '--.-': 'Q', '.-.': 'R',
            '...': 'S', '-': 'T', '..-': 'U', '...-': 'V', '.--': 'W', '-..-': 'X',
            '-.--': 'Y', '--..': 'Z', '-----': '0', '.----': '1', '..---': '2',
            '...--': '3', '....-': '4', '.....': '5', '-....': '6', '--...': '7',
            '---..': '8', '----.': '9', '/': ' '
        };
        try {
            const result = input.split(' ').map(code => morseReverse[code] || code).join('');
            setOutput(result);
            setError('');
        } catch (e: any) {
            setError(`Decoding failed: ${e.message}`);
        }
    };

    const octalEncode = () => {
        const result = input.split('').map(char =>
            '\\' + char.charCodeAt(0).toString(8).padStart(3, '0')
        ).join('');
        setOutput(result);
        setError('');
    };

    const decimalEncode = () => {
        const result = input.split('').map(char => char.charCodeAt(0)).join(' ');
        setOutput(result);
        setError('');
    };

    const decimalDecode = () => {
        try {
            const result = input.split(' ').map(code =>
                String.fromCharCode(parseInt(code))
            ).join('');
            setOutput(result);
            setError('');
        } catch (e: any) {
            setError(`Decoding failed: ${e.message}`);
        }
    };

    const reverseString = () => {
        setOutput(input.split('').reverse().join(''));
        setError('');
    };

    const toUpperCase = () => {
        setOutput(input.toUpperCase());
        setError('');
    };

    const toLowerCase = () => {
        setOutput(input.toLowerCase());
        setError('');
    };

    const unicodeEscape = () => {
        const result = input.split('').map(char =>
            '\\u' + char.charCodeAt(0).toString(16).padStart(4, '0')
        ).join('');
        setOutput(result);
        setError('');
    };

    const jsonBeautify = () => {
        try {
            const parsed = JSON.parse(input);
            setOutput(JSON.stringify(parsed, null, 2));
            setError('');
        } catch (e: any) {
            setError(`Invalid JSON: ${e.message}`);
        }
    };

    const jsonMinify = () => {
        try {
            const parsed = JSON.parse(input);
            setOutput(JSON.stringify(parsed));
            setError('');
        } catch (e: any) {
            setError(`Invalid JSON: ${e.message}`);
        }
    };

    // HASHING FUNCTIONS
    const hashMD5 = () => {
        const hash = CryptoJS.MD5(input).toString();
        setOutput(hash);
        setError('');
    };

    const hashSHA1 = () => {
        const hash = CryptoJS.SHA1(input).toString();
        setOutput(hash);
        setError('');
    };

    const hashSHA256 = () => {
        const hash = CryptoJS.SHA256(input).toString();
        setOutput(hash);
        setError('');
    };

    const hashSHA512 = () => {
        const hash = CryptoJS.SHA512(input).toString();
        setOutput(hash);
        setError('');
    };

    const hashSHA3 = () => {
        const hash = CryptoJS.SHA3(input).toString();
        setOutput(hash);
        setError('');
    };

    const hashRIPEMD160 = () => {
        const hash = CryptoJS.RIPEMD160(input).toString();
        setOutput(hash);
        setError('');
    };

    // MODERN FUNCTIONS
    const generateHMAC = () => {
        const hmac = CryptoJS.HmacSHA256(input, key).toString();
        setOutput(hmac);
        setError('');
    };

    const generatePBKDF2 = () => {
        const derived = CryptoJS.PBKDF2(input, key, { keySize: 256 / 32, iterations: 1000 }).toString();
        setOutput(derived);
        setError('');
    };

    // JWT SECRET KEY GENERATOR
    const generateJWTSecret = () => {
        const length = jwtKeyLength / 8; // Convert bits to bytes
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

    const renderTabContent = () => {
        switch (activeTab) {
            case 'encrypt':
                return (
                    <div className="space-y-3">
                        <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                            <ActionButton icon={<Lock size={14} />} label="AES Encrypt" onClick={encryptAES} />
                            <ActionButton icon={<Unlock size={14} />} label="AES Decrypt" onClick={decryptAES} variant="secondary" />
                            <ActionButton icon={<Lock size={14} />} label="3DES Encrypt" onClick={encryptTripleDES} />
                            <ActionButton icon={<Unlock size={14} />} label="3DES Decrypt" onClick={decryptTripleDES} variant="secondary" />
                            <ActionButton icon={<Lock size={14} />} label="RC4 Encrypt" onClick={encryptRC4} />
                            <ActionButton icon={<Unlock size={14} />} label="RC4 Decrypt" onClick={decryptRC4} variant="secondary" />
                            <ActionButton icon={<Lock size={14} />} label="Rabbit Encrypt" onClick={encryptRabbit} />
                            <ActionButton icon={<Unlock size={14} />} label="Rabbit Decrypt" onClick={decryptRabbit} variant="secondary" />
                        </div>
                    </div>
                );

            case 'encode':
                return (
                    <div className="space-y-3">
                        <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                            <ActionButton icon={<Key size={14} />} label="Base64 Encode" onClick={encodeBase64} />
                            <ActionButton icon={<Key size={14} />} label="Base64 Decode" onClick={decodeBase64} variant="secondary" />
                            <ActionButton icon={<Key size={14} />} label="Hex Encode" onClick={encodeHex} />
                            <ActionButton icon={<Key size={14} />} label="Hex Decode" onClick={decodeHex} variant="secondary" />
                            <ActionButton icon={<Key size={14} />} label="Binary Encode" onClick={encodeBinary} />
                            <ActionButton icon={<Key size={14} />} label="Binary Decode" onClick={decodeBinary} variant="secondary" />
                            <ActionButton icon={<Key size={14} />} label="URL Encode" onClick={encodeURL} />
                            <ActionButton icon={<Key size={14} />} label="URL Decode" onClick={decodeURL} variant="secondary" />
                            <ActionButton icon={<Key size={14} />} label="HTML Encode" onClick={encodeHTML} />
                            <ActionButton icon={<Key size={14} />} label="ROT13" onClick={rot13} />
                            <ActionButton icon={<Key size={14} />} label="Caesar +3" onClick={() => caesarCipher(3)} />
                            <ActionButton icon={<Key size={14} />} label="Caesar -3" onClick={() => caesarCipher(-3)} variant="secondary" />
                        </div>
                    </div>
                );

            case 'hash':
                return (
                    <div className="space-y-3">
                        <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                            <ActionButton icon={<Hash size={14} />} label="MD5" onClick={hashMD5} />
                            <ActionButton icon={<Hash size={14} />} label="SHA-1" onClick={hashSHA1} />
                            <ActionButton icon={<Hash size={14} />} label="SHA-256" onClick={hashSHA256} />
                            <ActionButton icon={<Hash size={14} />} label="SHA-512" onClick={hashSHA512} />
                            <ActionButton icon={<Hash size={14} />} label="SHA3" onClick={hashSHA3} />
                            <ActionButton icon={<Hash size={14} />} label="RIPEMD-160" onClick={hashRIPEMD160} />
                        </div>
                    </div>
                );

            case 'modern':
                return (
                    <div className="space-y-3">
                        <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                            <ActionButton icon={<Key size={14} />} label="HMAC-SHA256" onClick={generateHMAC} />
                            <ActionButton icon={<Key size={14} />} label="PBKDF2" onClick={generatePBKDF2} />
                        </div>
                    </div>
                );

            case 'converter':
                return (
                    <div className="space-y-3">
                        <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                            <ActionButton icon={<Key size={14} />} label="Atbash Cipher" onClick={atbashCipher} />
                            <ActionButton icon={<Key size={14} />} label="Morse Encode" onClick={morseEncode} />
                            <ActionButton icon={<Key size={14} />} label="Morse Decode" onClick={morseDecode} variant="secondary" />
                            <ActionButton icon={<Key size={14} />} label="Octal Encode" onClick={octalEncode} />
                            <ActionButton icon={<Key size={14} />} label="Decimal Encode" onClick={decimalEncode} />
                            <ActionButton icon={<Key size={14} />} label="Decimal Decode" onClick={decimalDecode} variant="secondary" />
                            <ActionButton icon={<Key size={14} />} label="Reverse" onClick={reverseString} />
                            <ActionButton icon={<Key size={14} />} label="UPPERCASE" onClick={toUpperCase} />
                            <ActionButton icon={<Key size={14} />} label="lowercase" onClick={toLowerCase} />
                            <ActionButton icon={<Key size={14} />} label="Unicode Escape" onClick={unicodeEscape} />
                            <ActionButton icon={<Key size={14} />} label="JSON Beautify" onClick={jsonBeautify} />
                            <ActionButton icon={<Key size={14} />} label="JSON Minify" onClick={jsonMinify} variant="secondary" />
                        </div>
                    </div>
                );

            case 'jwt':
                return (
                    <div className="space-y-4">
                        {/* Algorithm Selection */}
                        <div>
                            <label className="text-xs text-gray-400 font-bold mb-2 block">JWT ALGORITHM</label>
                            <div className="grid grid-cols-3 gap-2">
                                {(['HS256', 'HS384', 'HS512'] as const).map((algo) => (
                                    <button
                                        key={algo}
                                        onClick={() => {
                                            setJwtAlgorithm(algo);
                                            if (algo === 'HS256') setJwtKeyLength(256);
                                            else if (algo === 'HS384') setJwtKeyLength(384);
                                            else setJwtKeyLength(512);
                                        }}
                                        className={`px-4 py-3 rounded font-bold text-sm transition-all ${jwtAlgorithm === algo
                                                ? 'bg-green-600 text-black border-2 border-green-400'
                                                : 'bg-gray-900 text-gray-400 border border-gray-700 hover:bg-gray-800 hover:text-green-400'
                                            }`}
                                    >
                                        {algo}
                                    </button>
                                ))}
                            </div>
                            <div className="mt-2 text-xs text-gray-500">
                                {jwtAlgorithm === 'HS256' && '• HMAC with SHA-256 - Most commonly used symmetric algorithm'}
                                {jwtAlgorithm === 'HS384' && '• HMAC with SHA-384 - Stronger hashing for enhanced security'}
                                {jwtAlgorithm === 'HS512' && '• HMAC with SHA-512 - Maximum security for sensitive applications'}
                            </div>
                        </div>

                        {/* Key Length Selection */}
                        <div>
                            <label className="text-xs text-gray-400 font-bold mb-2 block">KEY LENGTH (bits)</label>
                            <div className="grid grid-cols-4 gap-2">
                                {[32, 64, 128, 256, 384, 512].map((length) => (
                                    <button
                                        key={length}
                                        onClick={() => setJwtKeyLength(length)}
                                        className={`px-3 py-2 rounded font-mono text-sm transition-all ${jwtKeyLength === length
                                                ? 'bg-blue-600 text-black border-2 border-blue-400'
                                                : 'bg-gray-900 text-gray-400 border border-gray-700 hover:bg-gray-800 hover:text-blue-400'
                                            }`}
                                    >
                                        {length}
                                    </button>
                                ))}
                            </div>
                        </div>

                        {/* Key Strength Indicator */}
                        <div>
                            <div className="flex justify-between items-center mb-2">
                                <label className="text-xs text-gray-400 font-bold">KEY STRENGTH</label>
                                <span className={`text-xs font-bold ${getKeyStrength(jwtKeyLength).color}`}>
                                    {getKeyStrength(jwtKeyLength).label}
                                </span>
                            </div>
                            <div className="h-2 bg-gray-900 rounded-full overflow-hidden border border-gray-700">
                                <div
                                    className="h-full bg-gradient-to-r from-red-500 via-yellow-500 to-green-500 transition-all duration-300"
                                    style={{ width: `${getKeyStrength(jwtKeyLength).percentage}%` }}
                                ></div>
                            </div>
                        </div>

                        {/* Generate Button */}
                        <button
                            onClick={generateJWTSecret}
                            className="w-full bg-green-600 hover:bg-green-500 text-black font-bold py-4 rounded transition-all flex items-center justify-center gap-2"
                        >
                            <Key size={18} />
                            Generate {jwtAlgorithm} Secret Key ({jwtKeyLength} bits)
                        </button>

                        {/* Generated Secret Key Display */}
                        {jwtSecretKey && (
                            <div className="space-y-3">
                                <div>
                                    <div className="flex items-center justify-between mb-2">
                                        <label className="text-xs text-gray-400 font-bold">GENERATED SECRET KEY</label>
                                        <button
                                            onClick={copyJWTSecret}
                                            className="flex items-center gap-1 text-xs text-green-500 hover:text-green-400 transition-colors"
                                        >
                                            {jwtCopied ? <Check size={12} /> : <Copy size={12} />}
                                            {jwtCopied ? 'Copied!' : 'Copy'}
                                        </button>
                                    </div>
                                    <div className="bg-gray-900 border-2 border-green-500 rounded p-4">
                                        <code className="text-green-400 font-mono text-sm break-all block">
                                            {jwtSecretKey}
                                        </code>
                                    </div>
                                </div>

                                {/* Key Info */}
                                <div className="grid grid-cols-3 gap-3">
                                    <div className="bg-black border border-gray-700 rounded p-3 text-center">
                                        <div className="text-xs text-gray-500 mb-1">Algorithm</div>
                                        <div className="text-green-400 font-bold">{jwtAlgorithm}</div>
                                    </div>
                                    <div className="bg-black border border-gray-700 rounded p-3 text-center">
                                        <div className="text-xs text-gray-500 mb-1">Length</div>
                                        <div className="text-green-400 font-bold">{jwtKeyLength} bits</div>
                                    </div>
                                    <div className="bg-black border border-gray-700 rounded p-3 text-center">
                                        <div className="text-xs text-gray-500 mb-1">Hex Length</div>
                                        <div className="text-green-400 font-bold">{jwtSecretKey.length} chars</div>
                                    </div>
                                </div>

                                {/* Usage Example */}
                                <div className="bg-blue-900/20 border border-blue-500 rounded p-4">
                                    <div className="text-xs text-blue-400 font-bold mb-2 flex items-center gap-2">
                                        <AlertCircle size={14} />
                                        Usage Example (Node.js)
                                    </div>
                                    <code className="text-blue-300 font-mono text-xs block">
                                        const jwt = require('jsonwebtoken');<br />
                                        const secret = '{jwtSecretKey.substring(0, 32)}...';<br />
                                        const token = jwt.sign({'{payload}'}, secret, {'{'} algorithm: '{jwtAlgorithm}' {'}'});
                                    </code>
                                </div>

                                {/* Security Notice */}
                                <div className="bg-orange-900/20 border border-orange-500 rounded p-3 text-xs text-orange-400">
                                    <div className="flex items-center gap-2 mb-1 font-bold">
                                        <AlertCircle size={14} />
                                        Security Best Practices
                                    </div>
                                    <ul className="text-orange-300 space-y-1 ml-4">
                                        <li>• Store secret keys in environment variables</li>
                                        <li>• Never commit secrets to version control</li>
                                        <li>• Use at least 256 bits for production</li>
                                        <li>• Rotate keys periodically</li>
                                    </ul>
                                </div>
                            </div>
                        )}
                    </div>
                );
        }
    };

    return (
        <div className="flex flex-col h-full bg-black">
            {/* Header */}
            <div className="p-4 border-b border-green-900">
                <div className="flex items-center gap-3 mb-4">
                    <Key size={24} className="text-green-500" />
                    <div>
                        <h2 className="font-orbitron font-bold text-white text-xl">CRYPTOGRAPHY LAB</h2>
                        <p className="text-xs text-gray-500">40+ Algorithms • Encryption, Encoding, Hashing, JWT Generator</p>
                    </div>
                </div>

                {/* Tabs */}
                <div className="flex gap-2 overflow-x-auto">
                    <TabButton active={activeTab === 'encrypt'} onClick={() => setActiveTab('encrypt')} label="Encryption" />
                    <TabButton active={activeTab === 'encode'} onClick={() => setActiveTab('encode')} label="Encoding" />
                    <TabButton active={activeTab === 'hash'} onClick={() => setActiveTab('hash')} label="Hashing" />
                    <TabButton active={activeTab === 'modern'} onClick={() => setActiveTab('modern')} label="Modern" />
                    <TabButton active={activeTab === 'converter'} onClick={() => setActiveTab('converter')} label="Converter" />
                    <TabButton active={activeTab === 'jwt'} onClick={() => setActiveTab('jwt')} label="JWT Generator" />
                </div>
            </div>

            {/* Main Content */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4">
                {/* Key Input (for encryption/decryption) */}
                {(activeTab === 'encrypt' || activeTab === 'modern') && (
                    <div>
                        <label className="text-xs text-gray-400 font-bold mb-2 block">SECRET KEY</label>
                        <input
                            type="text"
                            value={key}
                            onChange={(e) => setKey(e.target.value)}
                            className="w-full bg-black border border-green-900 rounded px-4 py-2 text-green-400 font-mono text-sm focus:border-green-500 focus:outline-none"
                            placeholder="Enter encryption key..."
                        />
                    </div>
                )}

                {/* Input */}
                <div>
                    <label className="text-xs text-gray-400 font-bold mb-2 block">INPUT</label>
                    <textarea
                        value={input}
                        onChange={(e) => setInput(e.target.value)}
                        className="w-full h-32 bg-black border border-green-900 rounded p-4 text-green-400 font-mono text-sm resize-none focus:border-green-500 focus:outline-none"
                        placeholder="Enter text to process..."
                    />
                </div>

                {/* Actions */}
                {renderTabContent()}

                {/* Error */}
                {error && (
                    <div className="bg-red-900/20 border border-red-500 rounded p-3 flex items-center gap-2 text-red-400 text-sm">
                        <AlertCircle size={16} />
                        {error}
                    </div>
                )}

                {/* Output */}
                <div>
                    <div className="flex items-center justify-between mb-2">
                        <label className="text-xs text-gray-400 font-bold">OUTPUT</label>
                        {output && (
                            <button
                                onClick={handleCopy}
                                className="flex items-center gap-1 text-xs text-green-500 hover:text-green-400 transition-colors"
                            >
                                {copied ? <Check size={12} /> : <Copy size={12} />}
                                {copied ? 'Copied!' : 'Copy'}
                            </button>
                        )}
                    </div>
                    <textarea
                        value={output}
                        readOnly
                        className="w-full h-32 bg-gray-900/50 border border-green-900 rounded p-4 text-green-400 font-mono text-sm resize-none focus:border-green-500 focus:outline-none"
                        placeholder="Output will appear here..."
                    />
                </div>
            </div>
        </div>
    );
};

const TabButton: React.FC<{ active: boolean; onClick: () => void; label: string }> = ({ active, onClick, label }) => (
    <button
        onClick={onClick}
        className={`px-4 py-2 rounded font-bold text-sm transition-all ${active
            ? 'bg-green-600 text-black'
            : 'bg-gray-900 text-gray-400 hover:bg-gray-800 hover:text-green-400'
            }`}
    >
        {label}
    </button>
);

const ActionButton: React.FC<{ icon: React.ReactNode; label: string; onClick: () => void; variant?: 'primary' | 'secondary' }> = ({
    icon,
    label,
    onClick,
    variant = 'primary'
}) => (
    <button
        onClick={onClick}
        className={`flex items-center justify-center gap-2 px-3 py-2 rounded text-xs font-bold transition-all ${variant === 'primary'
            ? 'bg-green-900/30 text-green-400 border border-green-900 hover:bg-green-900/50 hover:border-green-500'
            : 'bg-blue-900/30 text-blue-400 border border-blue-900 hover:bg-blue-900/50 hover:border-blue-500'
            }`}
    >
        {icon}
        {label}
    </button>
);

export default CryptoLab;