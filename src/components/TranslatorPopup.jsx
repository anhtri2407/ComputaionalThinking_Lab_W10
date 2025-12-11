import React, { useState } from 'react';
import { translateText } from '../services/api';
import './TranslatorPopup.css';

function TranslatorPopup() {
  const [isOpen, setIsOpen] = useState(false);
  const [inputText, setInputText] = useState('');
  const [translatedText, setTranslatedText] = useState('');
  const [isTranslating, setIsTranslating] = useState(false);
  const [error, setError] = useState(null);

  const handleTranslate = async () => {
    if (!inputText.trim()) {
      setError('Vui lòng nhập văn bản để dịch');
      return;
    }

    setIsTranslating(true);
    setError(null);
    setTranslatedText('');

    try {
      // Using backend API for translation
      const result = await translateText(inputText, 'en', 'vi');
      setTranslatedText(result.translated_text);
    } catch (err) {
      console.error('Translation error:', err);
      setError('Lỗi dịch thuật. Vui lòng thử lại.');
    } finally {
      setIsTranslating(false);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleTranslate();
    }
  };

  const clearAll = () => {
    setInputText('');
    setTranslatedText('');
    setError(null);
  };

  const copyToClipboard = () => {
    if (translatedText) {
      navigator.clipboard.writeText(translatedText);
    }
  };

  return (
    <>
      {/* Floating Button */}
      <button
        className="translator-fab"
        onClick={() => setIsOpen(!isOpen)}
        title="Translate English to Vietnamese"
      >
        🌐
      </button>

      {/* Popup */}
      {isOpen && (
        <div className="translator-popup">
          <div className="translator-header">
            <h3>🌐 English → Vietnamese Translator</h3>
            <button
              className="close-btn"
              onClick={() => setIsOpen(false)}
            >
              ✕
            </button>
          </div>

          <div className="translator-body">
            {/* Input Section */}
            <div className="input-section">
              <label>English (Tiếng Anh):</label>
              <textarea
                value={inputText}
                onChange={(e) => setInputText(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder="Enter English text here..."
                rows={3}
                disabled={isTranslating}
              />
            </div>

            {/* Buttons */}
            <div className="translator-buttons">
              <button
                className="translate-btn"
                onClick={handleTranslate}
                disabled={isTranslating || !inputText.trim()}
              >
                {isTranslating ? '⏳ Đang dịch...' : '🔄 Dịch'}
              </button>
              <button
                className="clear-btn"
                onClick={clearAll}
                disabled={isTranslating}
              >
                🗑️ Clear
              </button>
            </div>

            {/* Error Message */}
            {error && (
              <div className="translator-error">
                ⚠️ {error}
              </div>
            )}

            {/* Output Section */}
            <div className="output-section">
              <div className="output-header">
                <label>Vietnamese (Tiếng Việt):</label>
                {translatedText && (
                  <button
                    className="copy-btn"
                    onClick={copyToClipboard}
                    title="Copy to clipboard"
                  >
                    📋 Copy
                  </button>
                )}
              </div>
              <div className="output-text">
                {translatedText || (
                  <span className="placeholder-text">
                    Translation will appear here...
                  </span>
                )}
              </div>
            </div>
          </div>

          <div className="translator-footer">
            <small>Powered by MyMemory Translation API</small>
          </div>
        </div>
      )}

      {/* Overlay */}
      {isOpen && (
        <div
          className="translator-overlay"
          onClick={() => setIsOpen(false)}
        />
      )}
    </>
  );
}

export default TranslatorPopup;
