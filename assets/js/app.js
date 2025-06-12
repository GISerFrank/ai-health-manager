// assets/js/main.js

// 应用状态管理
class HealthApp {
    constructor() {
        this.currentPage = 'dashboard';
        this.symptoms = this.loadSymptoms();
        this.medications = this.loadMedications();
        this.recoveryData = this.loadRecoveryData();
        this.init();
    }

    init() {
        this.bindEvents();
        this.updateProgressBar();
        this.startProgressAnimation();
        this.updateMedicationStatus();
    }

    // 事件绑定
    bindEvents() {
        // 导航标签事件
        document.querySelectorAll('.nav-tab').forEach(tab => {
            tab.addEventListener('click', (e) => {
                const pageId = e.target.getAttribute('onclick').match(/'([^']+)'/)[1];
                this.showPage(pageId);
            });
        });

        // 快速操作按钮事件
        document.querySelectorAll('.action-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const pageId = e.currentTarget.getAttribute('onclick')?.match(/'([^']+)'/)?.[1];
                if (pageId) {
                    this.showPage(pageId);
                }
            });
        });

        // 浮动添加按钮
        const floatingBtn = document.querySelector('.floating-add-btn');
        if (floatingBtn) {
            floatingBtn.addEventListener('click', () => {
                this.showPage('symptoms');
            });
        }

        // 表单提交事件
        const analyzeBtn = document.querySelector('.primary-btn[onclick="analyzeSymptoms()"]');
        if (analyzeBtn) {
            analyzeBtn.addEventListener('click', (e) => {
                e.preventDefault();
                this.analyzeSymptoms();
            });
        }
    }

    // 页面切换
    showPage(pageId) {
        // 隐藏所有页面
        document.querySelectorAll('.page').forEach(page => {
            page.classList.remove('active');
        });

        // 移除所有标签的active状态
        document.querySelectorAll('.nav-tab').forEach(tab => {
            tab.classList.remove('active');
        });

        // 显示指定页面
        const targetPage = document.getElementById(pageId);
        if (targetPage) {
            targetPage.classList.add('active');
        }

        // 激活对应标签
        const tabMapping = {
            'dashboard': 0,
            'symptoms': 1,
            'recovery': 2,
            'reports': 3
        };
        const tabs = document.querySelectorAll('.nav-tab');
        if (tabs[tabMapping[pageId]]) {
            tabs[tabMapping[pageId]].classList.add('active');
        }

        this.currentPage = pageId;
        this.updatePageData(pageId);
    }

    // 更新页面数据
    updatePageData(pageId) {
        switch(pageId) {
            case 'dashboard':
                this.updateDashboard();
                break;
            case 'recovery':
                this.updateRecoveryPage();
                break;
            case 'reports':
                this.updateReportsPage();
                break;
        }
    }

    // 症状严重程度选择
    selectSeverity(element, level) {
        // 移除所有选中状态
        document.querySelectorAll('.severity-option').forEach(option => {
            option.classList.remove('selected');
        });

        // 添加选中状态
        element.classList.add('selected');

        // 保存选择的级别
        this.selectedSeverity = level;
    }

    // AI症状分析
    async analyzeSymptoms() {
        const analysisResult = document.getElementById('analysis-result');
        const analyzeBtn = document.querySelector('.primary-btn[onclick="analyzeSymptoms()"]');

        if (!analysisResult || !analyzeBtn) return;

        // 显示加载状态
        analyzeBtn.innerHTML = '<span class="loading"></span> AI分析中...';
        analyzeBtn.disabled = true;

        // 收集表单数据
        const formData = this.collectSymptomData();

        try {
            // 模拟AI分析（这里可以集成真实的AI API）
            const analysis = await this.simulateAIAnalysis(formData);

            // 更新分析结果
            this.updateAnalysisResult(analysis);

            // 保存症状数据
            this.saveSymptom(formData, analysis);

            // 显示分析结果
            analysisResult.style.display = 'block';
            analysisResult.scrollIntoView({ behavior: 'smooth' });

            // 显示成功通知
            this.showNotification('AI分析完成！', 'success');

        } catch (error) {
            console.error('AI分析失败:', error);
            this.showNotification('分析失败，请重试', 'error');
        } finally {
            // 恢复按钮状态
            analyzeBtn.innerHTML = '🤖 AI分析症状';
            analyzeBtn.disabled = false;
        }
    }

    // 收集症状表单数据
    collectSymptomData() {
        const form = document.querySelector('.symptom-form');
        const formData = new FormData(form);

        return {
            symptom: form.querySelector('select').value,
            severity: this.selectedSeverity || 3,
            description: form.querySelector('textarea').value,
            temperature: form.querySelector('input[type="number"]').value,
            timestamp: new Date().toISOString()
        };
    }

    // 模拟AI分析
    async simulateAIAnalysis(data) {
        // 模拟网络延迟
        await new Promise(resolve => setTimeout(resolve, 2000));

        const diagnoses = {
            '发热': {
                diagnosis: '可能的病毒性感染，建议密切观察',
                medication: '对乙酰氨基酚退热，多饮水',
                advice: '充分休息，如持续高热超过3天请就医',
                recoveryTime: '3-5天'
            },
            '咳嗽': {
                diagnosis: '上呼吸道感染可能性较大',
                medication: '止咳糖浆，避免刺激性食物',
                advice: '保持室内湿润，避免烟尘刺激',
                recoveryTime: '5-7天'
            },
            '鼻塞/流涕': {
                diagnosis: '普通感冒症状',
                medication: '鼻喷剂缓解鼻塞，抗组胺药物',
                advice: '多喝温水，注意保暖',
                recoveryTime: '4-6天'
            }
        };

        return diagnoses[data.symptom] || {
            diagnosis: '症状较轻，建议观察',
            medication: '对症处理即可',
            advice: '注意休息，多喝水',
            recoveryTime: '2-3天'
        };
    }

    // 更新分析结果显示
    updateAnalysisResult(analysis) {
        const resultDiv = document.getElementById('analysis-result');
        resultDiv.innerHTML = `
            <h4>🤖 AI分析结果</h4>
            <p><strong>初步判断：</strong>${analysis.diagnosis}</p>
            <p><strong>建议用药：</strong>${analysis.medication}</p>
            <p><strong>注意事项：</strong>${analysis.advice}</p>
            <p><strong>预计康复时间：</strong>${analysis.recoveryTime}</p>
        `;
    }

    // 进度条动画
    updateProgressBar() {
        const progressFill = document.querySelector('.progress-fill');
        if (progressFill) {
            const progress = this.calculateRecoveryProgress();
            progressFill.style.width = progress + '%';
        }
    }

    // 计算康复进度
    calculateRecoveryProgress() {
        const daysIll = this.getDaysIll();
        const expectedDays = 7; // 预期康复天数
        return Math.min((daysIll / expectedDays) * 100, 90);
    }

    // 获取生病天数
    getDaysIll() {
        const startDate = new Date('2025-06-06'); // 模拟开始日期
        const today = new Date();
        const diffTime = Math.abs(today - startDate);
        return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    }

    // 启动进度动画
    startProgressAnimation() {
        setInterval(() => {
            const progressFill = document.querySelector('.progress-fill');
            if (progressFill) {
                const currentWidth = parseInt(progressFill.style.width) || 0;
                if (currentWidth < 90) {
                    progressFill.style.width = (currentWidth + 1) + '%';
                }
            }
        }, 10000); // 每10秒增加1%
    }

    // 更新用药状态
    updateMedicationStatus() {
        const medicationCards = document.querySelectorAll('.medication-card');
        medicationCards.forEach((card, index) => {
            const status = card.querySelector('.medication-status');
            const time = card.querySelector('.medication-info p').textContent;

            if (this.shouldBeTaken(time)) {
                status.textContent = '已服用';
                status.className = 'medication-status taken';
            } else {
                status.textContent = '待服用';
                status.className = 'medication-status pending';
            }
        });
    }

    // 判断是否应该已经服药
    shouldBeTaken(timeText) {
        const now = new Date();
        const currentHour = now.getHours();

        if (timeText.includes('08:30') && currentHour >= 9) {
            return true;
        }
        if (timeText.includes('19:00') && currentHour >= 19) {
            return true;
        }
        return false;
    }

    // 数据持久化方法
    saveSymptom(symptomData, analysis) {
        this.symptoms.push({
            ...symptomData,
            analysis,
            id: Date.now()
        });
        localStorage.setItem('healthApp_symptoms', JSON.stringify(this.symptoms));
    }

    loadSymptoms() {
        const stored = localStorage.getItem('healthApp_symptoms');
        return stored ? JSON.parse(stored) : [];
    }

    loadMedications() {
        const stored = localStorage.getItem('healthApp_medications');
        return stored ? JSON.parse(stored) : [
            {
                id: 1,
                name: '感康复方氨酚烷胺片',
                dosage: '每日3次，每次1片',
                times: ['08:30', '14:30', '20:30'],
                startDate: '2025-06-06'
            }
        ];
    }

    loadRecoveryData() {
        const stored = localStorage.getItem('healthApp_recovery');
        return stored ? JSON.parse(stored) : [];
    }

    // 更新仪表板
    updateDashboard() {
        const daysIll = this.getDaysIll();
        const statusCard = document.querySelector('.status-card p');
        if (statusCard) {
            statusCard.textContent = `感冒症状，第${daysIll}天 • 整体改善趋势良好`;
        }
    }

    // 更新康复页面
    updateRecoveryPage() {
        const progressText = document.querySelector('.progress-chart p');
        if (progressText) {
            const progress = this.calculateRecoveryProgress();
            const remainingDays = Math.max(0, 7 - this.getDaysIll());
            progressText.textContent = `${Math.round(progress)}% - 预计还需${remainingDays}天完全康复`;
        }
    }

    // 更新报告页面
    updateReportsPage() {
        // 这里可以添加报告页面的数据更新逻辑
    }

    // 显示通知
    showNotification(message, type = 'info') {
        // 移除现有通知
        const existing = document.querySelector('.notification');
        if (existing) {
            existing.remove();
        }

        // 创建新通知
        const notification = document.createElement('div');
        notification.className = `notification ${type}`;
        notification.textContent = message;

        // 添加到页面
        document.body.appendChild(notification);

        // 3秒后自动移除
        setTimeout(() => {
            notification.remove();
        }, 3000);
    }

    // 导出数据功能
    exportData() {
        const data = {
            symptoms: this.symptoms,
            medications: this.medications,
            recoveryData: this.recoveryData,
            exportDate: new Date().toISOString()
        };

        const blob = new Blob([JSON.stringify(data, null, 2)], {
            type: 'application/json'
        });

        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `health_report_${new Date().toISOString().split('T')[0]}.json`;
        a.click();

        URL.revokeObjectURL(url);
        this.showNotification('数据导出成功！', 'success');
    }
}

// DOM加载完成后初始化应用
document.addEventListener('DOMContentLoaded', () => {
    window.healthApp = new HealthApp();

    // 绑定全局函数（保持向后兼容）
    window.showPage = (pageId) => window.healthApp.showPage(pageId);
    window.selectSeverity = (element, level) => window.healthApp.selectSeverity(element, level);
    window.analyzeSymptoms = () => window.healthApp.analyzeSymptoms();
});

// 页面可见性变化时更新数据
document.addEventListener('visibilitychange', () => {
    if (!document.hidden) {
        window.healthApp?.updateMedicationStatus();
        window.healthApp?.updateProgressBar();
    }
});

// 在线/离线状态检测
window.addEventListener('online', () => {
    window.healthApp?.showNotification('网络连接已恢复', 'success');
});

window.addEventListener('offline', () => {
    window.healthApp?.showNotification('网络连接已断开，数据将保存在本地', 'warning');
});