import React, { useState, useEffect } from 'react';
import { Upload, Download, Trash2, Folder, File, FolderPlus, RefreshCw, Share2, AlertCircle, CheckCircle } from 'lucide-react';

interface FileItem {
    name: string;
    type: 'file' | 'directory';
    size: number;
    modified: Date;
}

const DatabaseViewer: React.FC = () => {
    const [files, setFiles] = useState<FileItem[]>([]);
    const [currentPath, setCurrentPath] = useState('/');
    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
    const [newFolderName, setNewFolderName] = useState('');
    const [showNewFolder, setShowNewFolder] = useState(false);
    const [selectedFile, setSelectedFile] = useState<File | null>(null);
    const [uploadProgress, setUploadProgress] = useState(0);

    useEffect(() => {
        loadFiles();
    }, [currentPath]);

    const loadFiles = async () => {
        setLoading(true);
        try {
            const res = await fetch(`/api/files/list?path=${encodeURIComponent(currentPath)}`);
            const data = await res.json();
            setFiles(data.files || []);
            setLoading(false);
        } catch (error) {
            showMessage('error', 'Failed to load files');
            setLoading(false);
        }
    };

    const showMessage = (type: 'success' | 'error', text: string) => {
        setMessage({ type, text });
        setTimeout(() => setMessage(null), 3000);
    };

    const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            setSelectedFile(e.target.files[0]);
        }
    };

    const handleUpload = async () => {
        if (!selectedFile) return;

        const formData = new FormData();
        formData.append('file', selectedFile);
        formData.append('path', currentPath);

        setUploadProgress(0);

        try {
            const res = await fetch('/api/files/upload', {
                method: 'POST',
                body: formData,
            });

            const data = await res.json();

            if (data.success) {
                showMessage('success', `Uploaded: ${selectedFile.name}`);
                setSelectedFile(null);
                loadFiles();
            } else {
                showMessage('error', data.error || 'Upload failed');
            }
            setUploadProgress(100);
        } catch (error) {
            showMessage('error', 'Upload failed');
            setUploadProgress(0);
        }
    };

    const handleDelete = async (filename: string, type: 'file' | 'directory') => {
        if (!confirm(`Delete ${type} "${filename}"?`)) return;

        try {
            const res = await fetch('/api/files/delete', {
                method: 'DELETE',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    path: currentPath === '/' ? filename : `${currentPath}/${filename}`,
                    type
                })
            });

            const data = await res.json();

            if (data.success) {
                showMessage('success', `Deleted: ${filename}`);
                loadFiles();
            } else {
                showMessage('error', data.error || 'Delete failed');
            }
        } catch (error) {
            showMessage('error', 'Delete failed');
        }
    };

    const handleDownload = async (filename: string) => {
        try {
            const filePath = currentPath === '/' ? filename : `${currentPath}/${filename}`;
            const res = await fetch(`/api/files/download?path=${encodeURIComponent(filePath)}`);

            if (res.ok) {
                const blob = await res.blob();
                const url = window.URL.createObjectURL(blob);
                const a = document.createElement('a');
                a.href = url;
                a.download = filename;
                a.click();
                window.URL.revokeObjectURL(url);
                showMessage('success', `Downloaded: ${filename}`);
            } else {
                showMessage('error', 'Download failed');
            }
        } catch (error) {
            showMessage('error', 'Download failed');
        }
    };

    const handleCreateFolder = async () => {
        if (!newFolderName.trim()) return;

        try {
            const res = await fetch('/api/files/folder', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    path: currentPath,
                    name: newFolderName
                })
            });

            const data = await res.json();

            if (data.success) {
                showMessage('success', `Created folder: ${newFolderName}`);
                setNewFolderName('');
                setShowNewFolder(false);
                loadFiles();
            } else {
                showMessage('error', data.error || 'Failed to create folder');
            }
        } catch (error) {
            showMessage('error', 'Failed to create folder');
        }
    };

    const navigateToFolder = (folderName: string) => {
        if (currentPath === '/') {
            setCurrentPath(`/${folderName}`);
        } else {
            setCurrentPath(`${currentPath}/${folderName}`);
        }
    };

    const navigateUp = () => {
        const parts = currentPath.split('/').filter(p => p);
        parts.pop();
        setCurrentPath(parts.length === 0 ? '/' : '/' + parts.join('/'));
    };

    const formatSize = (bytes: number) => {
        if (bytes < 1024) return `${bytes} B`;
        if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
        return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
    };

    return (
        <div className="flex flex-col h-full bg-black">
            {/* Header */}
            <div className="p-4 border-b border-green-900">
                <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-3">
                        <Folder size={24} className="text-green-500" />
                        <div>
                            <h2 className="font-orbitron font-bold text-white text-xl">DATA BREACH VAULT</h2>
                            <p className="text-xs text-gray-500 font-mono">Secure File Storage & Management</p>
                        </div>
                    </div>

                    <button
                        onClick={loadFiles}
                        className="p-2 hover:bg-green-900/20 rounded transition-colors text-gray-400 hover:text-green-400"
                        title="Refresh"
                    >
                        <RefreshCw size={18} />
                    </button>
                </div>

                {/* Path Navigation */}
                <div className="flex items-center gap-2 text-sm font-mono mb-4">
                    <span className="text-gray-500">Path:</span>
                    <button
                        onClick={() => setCurrentPath('/')}
                        className="text-green-400 hover:text-green-300 transition-colors"
                    >
                        /
                    </button>
                    {currentPath.split('/').filter(p => p).map((part, i, arr) => (
                        <React.Fragment key={i}>
                            <span className="text-gray-700">/</span>
                            <button
                                onClick={() => setCurrentPath('/' + arr.slice(0, i + 1).join('/'))}
                                className="text-green-400 hover:text-green-300 transition-colors"
                            >
                                {part}
                            </button>
                        </React.Fragment>
                    ))}
                </div>

                {/* Actions */}
                <div className="flex flex-wrap gap-2">
                    <label className="flex items-center gap-2 px-4 py-2 rounded bg-green-600 hover:bg-green-500 text-black font-bold text-sm cursor-pointer transition-colors">
                        <Upload size={16} />
                        Upload File
                        <input
                            type="file"
                            onChange={handleFileSelect}
                            className="hidden"
                        />
                    </label>

                    {selectedFile && (
                        <button
                            onClick={handleUpload}
                            className="flex items-center gap-2 px-4 py-2 rounded bg-blue-600 hover:bg-blue-500 text-white font-bold text-sm transition-colors"
                        >
                            <CheckCircle size={16} />
                            Upload: {selectedFile.name}
                        </button>
                    )}

                    <button
                        onClick={() => setShowNewFolder(!showNewFolder)}
                        className="flex items-center gap-2 px-4 py-2 rounded bg-gray-700 hover:bg-gray-600 text-white font-bold text-sm transition-colors"
                    >
                        <FolderPlus size={16} />
                        New Folder
                    </button>

                    {currentPath !== '/' && (
                        <button
                            onClick={navigateUp}
                            className="flex items-center gap-2 px-4 py-2 rounded bg-gray-800 hover:bg-gray-700 text-gray-300 font-bold text-sm transition-colors"
                        >
                            ← Back
                        </button>
                    )}
                </div>

                {/* New Folder Input */}
                {showNewFolder && (
                    <div className="flex gap-2 mt-3">
                        <input
                            type="text"
                            value={newFolderName}
                            onChange={(e) => setNewFolderName(e.target.value)}
                            onKeyPress={(e) => e.key === 'Enter' && handleCreateFolder()}
                            placeholder="Folder name..."
                            className="flex-1 bg-black border border-green-900 rounded px-3 py-2 text-green-400 font-mono text-sm focus:border-green-500 focus:outline-none"
                            autoFocus
                        />
                        <button
                            onClick={handleCreateFolder}
                            className="px-4 py-2 rounded bg-green-600 hover:bg-green-500 text-black font-bold text-sm transition-colors"
                        >
                            Create
                        </button>
                        <button
                            onClick={() => { setShowNewFolder(false); setNewFolderName(''); }}
                            className="px-4 py-2 rounded bg-gray-700 hover:bg-gray-600 text-white font-bold text-sm transition-colors"
                        >
                            Cancel
                        </button>
                    </div>
                )}
            </div>

            {/* Message */}
            {message && (
                <div className={`mx-4 mt-3 p-3 rounded border flex items-center gap-2 ${message.type === 'success'
                        ? 'bg-green-900/20 border-green-500 text-green-400'
                        : 'bg-red-900/20 border-red-500 text-red-400'
                    }`}>
                    {message.type === 'success' ? <CheckCircle size={16} /> : <AlertCircle size={16} />}
                    {message.text}
                </div>
            )}

            {/* File List */}
            <div className="flex-1 overflow-y-auto p-4">
                {loading ? (
                    <div className="text-center text-gray-500 py-8">Loading...</div>
                ) : files.length === 0 ? (
                    <div className="text-center text-gray-600 py-12">
                        <Folder size={48} className="mx-auto mb-3 opacity-50" />
                        <p>No files yet. Upload your first file!</p>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 gap-2">
                        {files.map((file, index) => (
                            <div
                                key={index}
                                className={`p-3 rounded border transition-all ${file.type === 'directory'
                                        ? 'bg-blue-900/10 border-blue-900 hover:bg-blue-900/20 cursor-pointer'
                                        : 'bg-gray-900/50 border-gray-800 hover:bg-gray-900'
                                    }`}
                                onClick={() => file.type === 'directory' && navigateToFolder(file.name)}
                            >
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-3 flex-1 min-w-0">
                                        {file.type === 'directory' ? (
                                            <Folder size={20} className="text-blue-400 flex-shrink-0" />
                                        ) : (
                                            <File size={20} className="text-green-400 flex-shrink-0" />
                                        )}
                                        <div className="min-w-0 flex-1">
                                            <p className="text-white font-mono text-sm truncate">{file.name}</p>
                                            <p className="text-xs text-gray-500">
                                                {file.type === 'file' && formatSize(file.size)}
                                            </p>
                                        </div>
                                    </div>

                                    {file.type === 'file' && (
                                        <div className="flex items-center gap-1 flex-shrink-0 ml-2" onClick={(e) => e.stopPropagation()}>
                                            <button
                                                onClick={() => handleDownload(file.name)}
                                                className="p-2 hover:bg-green-900/30 rounded transition-colors text-green-500 hover:text-green-400"
                                                title="Download"
                                            >
                                                <Download size={16} />
                                            </button>
                                            <button
                                                onClick={() => handleDelete(file.name, 'file')}
                                                className="p-2 hover:bg-red-900/30 rounded transition-colors text-red-500 hover:text-red-400"
                                                title="Delete"
                                            >
                                                <Trash2 size={16} />
                                            </button>
                                        </div>
                                    )}

                                    {file.type === 'directory' && (
                                        <div className="flex items-center gap-1 flex-shrink-0 ml-2" onClick={(e) => e.stopPropagation()}>
                                            <button
                                                onClick={() => handleDelete(file.name, 'directory')}
                                                className="p-2 hover:bg-red-900/30 rounded transition-colors text-red-500 hover:text-red-400"
                                                title="Delete"
                                            >
                                                <Trash2 size={16} />
                                            </button>
                                        </div>
                                    )}
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>

            {/* Footer Stats */}
            <div className="p-3 border-t border-green-900 bg-black/50 flex justify-between text-xs text-gray-600 font-mono">
                <span>{files.length} items</span>
                <span>Backend: /data-breach{currentPath}</span>
            </div>
        </div>
    );
};

export default DatabaseViewer;