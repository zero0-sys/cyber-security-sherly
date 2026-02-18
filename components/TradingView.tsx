import React from 'react';
import { AdvancedRealTimeChart } from 'react-ts-tradingview-widgets';
import { ChevronLeft } from 'lucide-react';

interface TradingViewProps {
    onBack?: () => void;
}

const TradingView: React.FC<TradingViewProps> = ({ onBack }) => {
    return (
        <div className="h-full flex flex-col bg-black">
            {/* Header */}
            <div className="p-2 border-b border-cyan-900 bg-black flex items-center justify-between">
                <button
                    onClick={onBack}
                    className="text-cyan-500 hover:text-cyan-400 flex items-center gap-2 text-sm font-bold transition-colors"
                >
                    <ChevronLeft size={16} /> Back to Hub
                </button>
                <div className="text-cyan-500/50 text-xs font-mono">
                    MARKET_DATA_STREAM // ACTIVE
                </div>
            </div>

            {/* Chart Container */}
            <div className="flex-1 w-full h-full">
                <AdvancedRealTimeChart
                    theme="dark"
                    autosize
                    symbol="BINANCE:BTCUSDT"
                    timezone="Etc/UTC"
                    style="1"
                    locale="en"
                    toolbar_bg="#f1f3f6"
                    enable_publishing={false}
                    hide_top_toolbar={false}
                    hide_legend={false}
                    save_image={false}
                    container_id="tradingview_chart"
                    allow_symbol_change={true}
                />
            </div>
        </div>
    );
};

export default TradingView;
