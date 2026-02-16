import { useState } from "react";
import { useLanguage } from "../contexts/LanguageContext";
import { useTheme } from "../contexts/ThemeContext";
import { supabase } from "../lib/supabaseClient";

export default function MembershipModal({ isOpen, onClose, user, onMemberUpdate }) {
    const { t } = useLanguage();
    const { currentTheme } = useTheme();
    const [billingCycle, setBillingCycle] = useState('yearly');
    const [loading, setLoading] = useState(false);
    const [status, setStatus] = useState(null); // null, 'success', 'error'

    if (!isOpen) return null;

    const handleSelectPlan = async (plan) => {
        if (!user) {
            alert('Please login to choose a plan');
            return;
        }

        setLoading(true);
        setStatus(null);

        try {
            const price = plan.id === 'monthly' ? 9.99 : 100.00;
            const { error } = await supabase.rpc('upsert_user_preferences', {
                user_uuid: user.id,
                membership_param: plan.id,
                membership_price_param: price
            });

            if (error) throw error;

            setStatus('success');
            if (onMemberUpdate) onMemberUpdate();

            // Close after 2 seconds on success
            setTimeout(() => {
                onClose();
                setStatus(null);
            }, 2000);

        } catch (error) {
            console.error('Error updating membership:', error);
            setStatus('error');
        } finally {
            setLoading(false);
        }
    };

    const plans = [
        {
            id: 'monthly',
            name: t('monthlyPlan'),
            price: '€9.99',
            interval: t('monthly').toLowerCase(),
            features: [
                t('fullKundliAnalysis'),
                t('dailyHoroscopeFeature'),
                t('personalizedRemediesFeature'),
                t('unlimitedChartGeneration')
            ],
            description: t('perfectGettingStarted')
        },
        {
            id: 'yearly',
            name: t('yearlyPlan'),
            price: '€100.00',
            interval: t('yearly').toLowerCase(),
            features: [
                t('allMonthlyFeatures'),
                t('prioritySupport'),
                t('advancedPredictions'),
                t('saveApprox20')
            ],
            description: t('bestValueLongTerm'),
            popular: true
        }
    ];

    return (
        <div className="fixed inset-0 z-[105] flex items-center justify-center p-4">
            <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose}></div>

            <div className={`relative w-full max-w-4xl max-h-[90vh] overflow-y-auto ${currentTheme.colors.surface} rounded-2xl border ${currentTheme.colors.border} shadow-2xl p-5 md:p-8 animate-in fade-in zoom-in-95 duration-200`}>
                <button
                    onClick={onClose}
                    className="absolute top-4 right-4 text-white/50 hover:text-white transition-colors"
                >
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                </button>

                <div className="text-center mb-6 md:mb-8">
                    <h2 className="text-xl md:text-3xl font-bold text-white mb-2">{t('unlockPremium')}</h2>
                    <p className="text-sm md:text-base text-gray-400 px-4 mb-8">{t('choosePlanDesc')}</p>

                    {status === 'success' && (
                        <div className="mb-6 p-4 bg-green-500/20 border border-green-500/50 rounded-xl text-green-400 font-bold animate-bounce">
                            ✨ {t('membershipSuccess')}
                        </div>
                    )}

                    {status === 'error' && (
                        <div className="mb-6 p-4 bg-red-500/20 border border-red-500/50 rounded-xl text-red-400 font-bold">
                            ❌ {t('membershipError')}
                        </div>
                    )}

                    {/* Toggle Switch */}
                    <div className="flex justify-center mb-4">
                        <div className="bg-white/5 p-1 rounded-full border border-white/10 flex items-center gap-1">
                            <button
                                onClick={() => setBillingCycle('monthly')}
                                className={`px-6 py-2 rounded-full text-sm font-bold transition-all duration-300 ${billingCycle === 'monthly'
                                    ? 'bg-white text-black shadow-lg'
                                    : 'text-white/60 hover:text-white'
                                    }`}
                            >
                                {t('monthly')}
                            </button>
                            <button
                                onClick={() => setBillingCycle('yearly')}
                                className={`px-6 py-2 rounded-full text-sm font-bold transition-all duration-300 ${billingCycle === 'yearly'
                                    ? 'bg-white text-black shadow-lg'
                                    : 'text-white/60 hover:text-white'
                                    }`}
                            >
                                {t('yearly')}
                                <span className="ml-2 text-[10px] bg-purple-500 text-white px-2 py-0.5 rounded-full">{t('save20')}</span>
                            </button>
                        </div>
                    </div>
                </div>

                <div className="max-w-md mx-auto">
                    {plans.filter(p => p.id === billingCycle).map((plan) => (
                        <div
                            key={plan.id}
                            className={`relative p-5 md:p-6 rounded-xl border-2 transition-all duration-300 hover:scale-[1.02] ${plan.popular
                                ? 'border-purple-500 bg-purple-500/10'
                                : `border-white/10 ${currentTheme.colors.surface} hover:border-white/20`
                                }`}
                        >
                            {plan.popular && (
                                <div className="absolute -top-3 left-1/2 -translate-x-1/2 px-4 py-1 bg-gradient-to-r from-purple-600 to-pink-600 rounded-full text-xs font-bold text-white shadow-lg">
                                    {t('mostPopular')}
                                </div>
                            )}

                            <div className="mb-4 md:mb-6">
                                <h3 className="text-lg md:text-xl font-bold text-white mb-1 md:mb-2">{plan.name}</h3>
                                <p className="text-xs md:text-sm text-gray-400 mb-3 md:mb-4">{plan.description}</p>
                                <div className="flex items-baseline gap-1">
                                    <span className="text-2xl md:text-3xl font-bold text-white">{plan.price}</span>
                                    <span className="text-xs md:text-sm text-gray-400">/{plan.interval}</span>
                                </div>
                            </div>

                            <ul className="space-y-2 md:space-y-3 mb-6 md:mb-8">
                                {plan.features.map((feature, idx) => (
                                    <li key={idx} className="flex items-start gap-3 text-xs md:text-sm text-gray-300">
                                        <svg className="w-4 h-4 md:w-5 md:h-5 text-green-400 shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                        </svg>
                                        {feature}
                                    </li>
                                ))}
                            </ul>

                            <button
                                onClick={() => handleSelectPlan(plan)}
                                disabled={loading}
                                className={`w-full py-3 rounded-lg font-bold transition-all duration-300 flex items-center justify-center gap-2 ${plan.popular
                                    ? 'bg-gradient-to-r from-purple-600 to-pink-600 hover:opacity-90 text-white shadow-lg hover:shadow-purple-500/25'
                                    : 'bg-white/10 hover:bg-white/20 text-white'
                                    } ${loading ? 'opacity-50 cursor-not-allowed' : ''}`}>
                                {loading ? (
                                    <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                                ) : (
                                    `${t('choosePlanLabel')} ${plan.name}`
                                )}
                            </button>
                        </div>
                    ))}
                </div>

                <p className="text-center text-xs text-gray-500 mt-6">
                    {t('securePayment')}
                </p>
            </div>
        </div>
    );
}
