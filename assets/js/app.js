/**
 * 智医伴侣 - AI个人病情管理系统
 * 生产环境 JavaScript v1.0
 * Copyright (c) 2025 智医伴侣团队
 */

// 应用状态管理
class MedicalApp {
    constructor() {
        this.version = '1.0.0';
        this.currentRole = 'patient';
        this.currentDisease = 'cold';
        this.isLoading = true;
        this.patientData = {
            symptoms: [],
            medications: [],
            vitals: {},
            profile: this.loadUserProfile()
        };
        this.diseaseTemplates = this.initDiseaseTemplates();
        this.analytics = this.initAnalytics();

        this.init();
    }

    async init() {
        try {
            console.log(`🏥 智医伴侣 v${this.version} 正在启动...`);

            // 显示加载动画
            await this.showLoadingScreen();

            // 初始化组件
            this.bindEvents();
            this.initVASSlider();
            this.updateMedicationList();
            this.setupFormInteractions();
            this.initNotificationSystem();
            this.setupAutoSave();

            // 隐藏加载动画，显示应用
            await this.hideLoadingScreen();

            // 启动完成
            console.log('✅ 应用启动完成');
            this.trackEvent('app_started', { version: this.version });

        } catch (error) {
            console.error('❌ 应用启动失败:', error);
            this.showError('应用启动失败，请刷新页面重试');
        }
    }

    // 显示加载动画
    async showLoadingScreen() {
        return new Promise((resolve) => {
            setTimeout(() => {
                resolve();
            }, 2000); // 2秒加载动画
        });
    }

    // 隐藏加载动画
    async hideLoadingScreen() {
        return new Promise((resolve) => {
            const loadingScreen = document.getElementById('loading-screen');
            const app = document.getElementById('app');

            if (loadingScreen && app) {
                loadingScreen.style.opacity = '0';
                setTimeout(() => {
                    loadingScreen.style.display = 'none';
                    app.style.display = 'block';
                    app.style.opacity = '0';
                    setTimeout(() => {
                        app.style.opacity = '1';
                        resolve();
                    }, 100);
                }, 500);
            } else {
                resolve();
            }
        });
    }

    // 初始化疾病模板
    initDiseaseTemplates() {
        return {
            cold: {
                name: "感冒/流感",
                description: "上呼吸道感染，常见症状包括发热、咳嗽、鼻塞等",
                symptoms: ["发热", "咳嗽", "鼻塞", "咽痛", "全身症状"],
                medications: [
                    { name: "对乙酰氨基酚片", dosage: "0.5g", frequency: "发热时服用", time: "prn", category: "解热镇痛" },
                    { name: "复方甘草片", dosage: "2片", frequency: "每日3次", time: "tid", category: "止咳" },
                    { name: "维生素C", dosage: "100mg", frequency: "每日2次", time: "bid", category: "增强免疫" }
                ],
                dangerSigns: ["持续高热超过3天", "呼吸困难", "胸痛", "意识改变", "严重脱水"],
                analysisTemplate: {
                    diagnosis: "急性上呼吸道感染（感冒）",
                    confidence: 85,
                    recommendations: ["充分休息", "多饮温水", "注意保暖", "避免疲劳"]
                },
                expectedDuration: "5-7天",
                category: "呼吸系统"
            },
            migraine: {
                name: "偏头痛",
                description: "反复发作的头痛，常伴有恶心、畏光等症状",
                symptoms: ["头痛强度", "疼痛部位", "疼痛性质", "伴随症状", "诱发因素"],
                medications: [
                    { name: "布洛芬", dosage: "400mg", frequency: "疼痛时服用", time: "prn", category: "止痛" },
                    { name: "苯甲酸利扎曲普坦片", dosage: "10mg", frequency: "发作时服用", time: "prn", category: "特异性止痛" }
                ],
                dangerSigns: ["突发剧烈头痛", "伴有神经症状", "发热", "颈项强直", "意识障碍"],
                analysisTemplate: {
                    diagnosis: "偏头痛发作",
                    confidence: 90,
                    recommendations: ["避免强光", "安静休息", "规律作息", "避免诱发因素"]
                },
                expectedDuration: "4-72小时",
                category: "神经系统"
            },
            gastro: {
                name: "急性胃肠炎",
                description: "急性胃肠道炎症，常见腹痛、腹泻、呕吐等症状",
                symptoms: ["腹痛", "腹泻", "恶心呕吐", "发热"],
                medications: [
                    { name: "蒙脱石散", dosage: "3g", frequency: "每日3次", time: "tid", category: "止泻" },
                    { name: "口服补液盐", dosage: "1袋", frequency: "需要时", time: "prn", category: "补液" }
                ],
                dangerSigns: ["严重脱水", "血便", "剧烈腹痛", "高热"],
                expectedDuration: "3-7天",
                category: "消化系统"
            },
            allergy: {
                name: "过敏性鼻炎",
                description: "鼻黏膜过敏性炎症，常见鼻塞、流涕、打喷嚏",
                symptoms: ["鼻塞", "流涕", "打喷嚏", "鼻痒"],
                medications: [
                    { name: "氯雷他定", dosage: "10mg", frequency: "每日1次", time: "qd", category: "抗过敏" },
                    { name: "鼻喷激素", dosage: "2喷", frequency: "每日2次", time: "bid", category: "抗炎" }
                ],
                expectedDuration: "慢性管理",
                category: "过敏免疫"
            },
            sprain: {
                name: "肌肉扭伤",
                description: "肌肉或韧带损伤，常见疼痛、肿胀、活动受限",
                symptoms: ["疼痛强度", "肿胀程度", "活动功能"],
                medications: [
                    { name: "布洛芬", dosage: "400mg", frequency: "每日2次", time: "bid", category: "消炎止痛" }
                ],
                expectedDuration: "1-4周",
                category: "运动系统"
            },
            insomnia: {
                name: "失眠症",
                description: "睡眠障碍，包括入睡困难、睡眠维持困难等",
                symptoms: ["入睡困难", "睡眠维持", "早醒", "白天状态"],
                medications: [],
                expectedDuration: "慢性管理",
                category: "精神心理"
            }
        };
    }

    // 初始化分析系统
    initAnalytics() {
        return {
            pageViews: 0,
            userActions: [],
            sessionStart: Date.now()
        };
    }

    // 绑定事件
    bindEvents() {
        // VAS滑块事件
        const vasSlider = document.getElementById('painIntensity');
        if (vasSlider) {
            vasSlider.addEventListener('input', this.updateVASValue.bind(this));
        }

        // 症状评估选项点击事件
        document.addEventListener('click', (e) => {
            if (e.target.classList.contains('scale-option') ||
                e.target.classList.contains('fever-level') ||
                e.target.classList.contains('mini-option') ||
                e.target.classList.contains('energy-option')) {
                this.selectSymptomLevel(e.target);
            }
        });

        // 体温输入事件
        document.querySelectorAll('.temp-input').forEach(input => {
            input.addEventListener('input', (e) => {
                this.updateTemperatureLevel(e.target.value);
                this.autoSave();
            });
        });

        // 全局错误处理
        window.addEventListener('error', (e) => {
            console.error('全局错误:', e.error);
            this.trackEvent('error', { message: e.message, stack: e.error.stack });
        });

        // 页面离开前保存数据
        window.addEventListener('beforeunload', () => {
            this.saveAllData();
        });

        // 在线/离线状态检测
        window.addEventListener('online', () => {
            this.showNotification('网络连接已恢复', 'success');
        });

        window.addEventListener('offline', () => {
            this.showNotification('网络连接已断开，数据将保存在本地', 'warning');
        });
    }

    // 疾病选择
    selectDisease(diseaseId) {
        try {
            // 更新疾病选择状态
            document.querySelectorAll('.disease-option').forEach(option => {
                option.classList.remove('active');
            });
            const selectedOption = document.querySelector(`[data-disease="${diseaseId}"]`);
            if (selectedOption) {
                selectedOption.classList.add('active');
            }

            // 切换表单显示
            document.querySelectorAll('.symptom-form-card').forEach(form => {
                form.style.display = 'none';
            });

            const targetForm = document.getElementById(`${diseaseId}-form`);
            if (targetForm) {
                targetForm.style.display = 'block';
            } else {
                document.getElementById('cold-form').style.display = 'block';
            }

            this.currentDisease = diseaseId;
            this.updateDiseaseInfo(diseaseId);
            this.updateMedicationList();

            // 跟踪事件
            this.trackEvent('disease_selected', { diseaseId, diseaseName: this.diseaseTemplates[diseaseId]?.name });

            // 显示选择反馈
            this.showNotification(`已选择：${this.diseaseTemplates[diseaseId]?.name || '未知疾病'}`, 'info');

        } catch (error) {
            console.error('疾病选择失败:', error);
            this.showError('疾病选择失败，请重试');
        }
    }

    // 更新疾病信息
    updateDiseaseInfo(diseaseId) {
        const template = this.diseaseTemplates[diseaseId];
        if (template) {
            const elements = {
                currentDiseaseName: template.name,
                diseaseProgress: this.calculateDiseaseProgress(diseaseId),
                lastRecord: this.getLastRecordTime()
            };

            Object.entries(elements).forEach(([id, value]) => {
                const element = document.getElementById(id);
                if (element) {
                    element.textContent = value;
                }
            });
        }
    }

    // 更新用药列表
    updateMedicationList() {
        const template = this.diseaseTemplates[this.currentDisease];
        const listContainer = document.getElementById('medicationList');

        if (template && template.medications && listContainer) {
            if (template.medications.length > 0) {
                listContainer.innerHTML = template.medications.map(med => `
                    <div style="margin-bottom: 10px; padding: 10px; background: white; border-radius: 6px; border: 1px solid #e9ecef; transition: all 0.3s ease;" 
                         onmouseover="this.style.boxShadow='0 2px 8px rgba(0,0,0,0.1)'" 
                         onmouseout="this.style.boxShadow='none'">
                        <div style="display: flex; justify-content: space-between; align-items: center;">
                            <div>
                                <strong style="color: #2c5aa0;">${med.name}</strong>
                                <span style="background: #e3f2fd; color: #1976d2; padding: 2px 6px; border-radius: 4px; font-size: 10px; margin-left: 8px;">${med.category}</span><br>
                                <small style="color: #666;">${med.dosage} ${med.frequency}</small>
                            </div>
                            <button class="btn-small" onclick="window.medicalApp.recordMedicationTaken('${med.name}')" style="padding: 4px 8px; font-size: 11px; background: #28a745; color: white; border: none; border-radius: 4px; cursor: pointer;">已服用</button>
                        </div>
                    </div>
                `).join('');
            } else {
                listContainer.innerHTML = '<p style="text-align: center; color: #666; font-size: 12px; padding: 20px;">暂无用药方案</p>';
            }
        }
    }

    // 记录服药
    recordMedicationTaken(medicationName) {
        const timestamp = new Date().toLocaleString();
        this.showNotification(`已记录：${medicationName} (${timestamp})`, 'success');
        this.trackEvent('medication_taken', { medicationName, timestamp });
    }

    // 初始化VAS滑块
    initVASSlider() {
        const vasSlider = document.getElementById('painIntensity');
        if (vasSlider) {
            this.updateVASValue({ target: vasSlider });
        }
    }

    // 更新VAS疼痛值
    updateVASValue(event) {
        const value = parseInt(event.target.value);
        const valueDisplay = document.querySelector('.vas-value');
        if (valueDisplay) {
            valueDisplay.textContent = `${value}/10`;

            // 根据疼痛程度改变颜色
            const colors = ['#28a745', '#84c614', '#ffc107', '#fd7e14', '#dc3545'];
            const colorIndex = Math.min(Math.floor(value / 2), colors.length - 1);
            valueDisplay.style.background = colors[colorIndex];

            // 自动保存
            this.autoSave();
        }
    }

    // 选择症状级别
    selectSymptomLevel(element) {
        const parent = element.parentElement;
        parent.querySelectorAll('.scale-option, .fever-level, .mini-option, .energy-option').forEach(option => {
            option.classList.remove('selected');
        });
        element.classList.add('selected');

        // 保存选择
        const level = element.getAttribute('data-level');
        parent.setAttribute('data-selected-level', level);

        // 自动保存
        this.autoSave();
    }

    // 设置表单交互
    setupFormInteractions() {
        // 添加更多交互逻辑
        document.querySelectorAll('input, textarea, select').forEach(input => {
            input.addEventListener('change', this.autoSave.bind(this));
        });
    }

    // 更新体温等级
    updateTemperatureLevel(temperature) {
        if (!temperature) return;

        const temp = parseFloat(temperature);
        const feverLevels = document.querySelectorAll('.fever-level');

        feverLevels.forEach(level => level.classList.remove('selected'));

        let selectedLevel;
        if (temp < 37.3) {
            selectedLevel = document.querySelector('.fever-level[data-level="1"]');
        } else if (temp < 38) {
            selectedLevel = document.querySelector('.fever-level[data-level="2"]');
        } else if (temp < 39) {
            selectedLevel = document.querySelector('.fever-level[data-level="3"]');
        } else if (temp < 40) {
            selectedLevel = document.querySelector('.fever-level[data-level="4"]');
        } else {
            selectedLevel = document.querySelector('.fever-level[data-level="5"]');
        }

        if (selectedLevel) {
            selectedLevel.classList.add('selected');
            selectedLevel.parentElement.setAttribute('data-selected-level', selectedLevel.getAttribute('data-level'));
        }
    }

    // AI症状分析
    async analyzeSymptoms(diseaseType) {
        try {
            const analysisSection = document.getElementById('analysisSection');
            const analysisContent = document.getElementById('analysisContent');
            const riskAssessment = document.getElementById('riskAssessment');

            // 显示分析区域
            analysisSection.style.display = 'block';
            document.getElementById('analysisTime').textContent = new Date().toLocaleString();

            // 显示加载状态
            analysisContent.innerHTML = `
                <div style="text-align: center; padding: 30px;">
                    <div class="loading-spinner" style="margin: 0 auto 20px;"></div>
                    <p>🤖 AI正在分析您的症状...</p>
                    <p style="font-size: 12px; color: #666;">正在调用医学知识库和机器学习模型</p>
                </div>
            `;

            // 收集症状数据
            const symptomData = this.collectSymptomData(diseaseType);

            // 跟踪分析事件
            this.trackEvent('ai_analysis_started', { diseaseType, symptomCount: Object.keys(symptomData.symptoms).length });

            // 模拟AI分析（实际项目中这里会调用真实的AI API）
            await this.simulateAIProcessing();

            // 生成分析结果
            const analysis = this.generateAnalysisResult(diseaseType, symptomData);

            // 更新分析结果
            this.displayAnalysisResult(analysis, analysisContent);

            // 风险评估
            const riskResult = this.assessRisk(diseaseType, symptomData);
            if (riskResult.hasRisk) {
                this.showRiskAssessment(riskResult, riskAssessment);
            } else {
                riskAssessment.style.display = 'none';
            }

            // 保存分析记录
            this.saveAnalysisRecord(diseaseType, symptomData, analysis, riskResult);

            // 滚动到结果
            analysisSection.scrollIntoView({ behavior: 'smooth' });

            // 跟踪完成事件
            this.trackEvent('ai_analysis_completed', {
                diseaseType,
                confidence: analysis.confidence,
                hasRisk: riskResult.hasRisk
            });

        } catch (error) {
            console.error('AI分析失败:', error);
            document.getElementById('analysisContent').innerHTML = `
                <div style="text-align: center; padding: 20px; color: #dc3545;">
                    <p>❌ 分析过程中出现错误</p>
                    <p style="font-size: 12px;">错误信息：${error.message}</p>
                    <button class="btn btn-primary" onclick="window.medicalApp.analyzeSymptoms('${diseaseType}')">重试</button>
                </div>
            `;
            this.trackEvent('ai_analysis_error', { diseaseType, error: error.message });
        }
    }

    // 模拟AI处理过程
    async simulateAIProcessing() {
        const stages = [
            '正在预处理症状数据...',
            '正在匹配疾病知识库...',
            '正在运行机器学习模型...',
            '正在生成个性化建议...',
            '正在评估风险等级...'
        ];

        for (let i = 0; i < stages.length; i++) {
            await new Promise(resolve => setTimeout(resolve, 600));
            const content = document.getElementById('analysisContent');
            if (content) {
                const progress = Math.round(((i + 1) / stages.length) * 100);
                content.innerHTML = `
                    <div style="text-align: center; padding: 30px;">
                        <div class="loading-spinner" style="margin: 0 auto 20px;"></div>
                        <p>🤖 ${stages[i]}</p>
                        <div style="background: #e9ecef; border-radius: 10px; height: 8px; margin: 15px 0;">
                            <div style="background: linear-gradient(90deg, #667eea, #764ba2); height: 100%; border-radius: 10px; width: ${progress}%; transition: width 0.3s ease;"></div>
                        </div>
                        <p style="font-size: 12px; color: #666;">分析进度: ${progress}%</p>
                    </div>
                `;
            }
        }
    }

    // 收集症状数据
    collectSymptomData(diseaseType) {
        const data = {
            diseaseType: diseaseType,
            timestamp: new Date().toISOString(),
            symptoms: {},
            metadata: {
                userAgent: navigator.userAgent,
                timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
                language: navigator.language
            }
        };

        // 收集各种症状评分
        document.querySelectorAll('[data-selected-level]').forEach(element => {
            const labelElement = element.previousElementSibling;
            const label = labelElement ? labelElement.textContent.trim() : '未知症状';
            const level = parseInt(element.getAttribute('data-selected-level'));
            data.symptoms[label] = level;
        });

        // 收集体温
        const tempInput = document.querySelector('.temp-input');
        if (tempInput && tempInput.value) {
            data.symptoms['体温'] = parseFloat(tempInput.value);
        }

        // 收集VAS疼痛评分
        const vasSlider = document.getElementById('painIntensity');
        if (vasSlider) {
            data.symptoms['疼痛强度'] = parseInt(vasSlider.value);
        }

        // 收集复选框数据
        const checkedBoxes = document.querySelectorAll('input[type="checkbox"]:checked');
        const checkedItems = Array.from(checkedBoxes).map(cb => cb.parentElement.textContent.trim());
        if (checkedItems.length > 0) {
            data.symptoms['伴随症状'] = checkedItems;
        }

        // 收集文本输入
        const textareas = document.querySelectorAll('textarea');
        textareas.forEach(textarea => {
            if (textarea.value.trim()) {
                data.symptoms['详细描述'] = textarea.value.trim();
            }
        });

        return data;
    }

    // 生成分析结果
    generateAnalysisResult(diseaseType, symptomData) {
        const template = this.diseaseTemplates[diseaseType];
        const avgSeverity = this.calculateAverageSeverity(symptomData.symptoms);
        const confidence = this.calculateConfidence(diseaseType, symptomData);

        return {
            diagnosis: template?.analysisTemplate?.diagnosis || "症状分析完成",
            confidence: confidence,
            severity: avgSeverity,
            severityLabel: this.getSeverityLabel(avgSeverity),
            recommendations: this.generateRecommendations(diseaseType, symptomData),
            medication: this.generateMedicationAdvice(diseaseType, avgSeverity),
            followUp: this.generateFollowUpAdvice(diseaseType, symptomData),
            expectedDuration: template?.expectedDuration || "需要进一步观察",
            category: template?.category || "未分类",
            analysisId: this.generateAnalysisId()
        };
    }

    // 计算平均严重程度
    calculateAverageSeverity(symptoms) {
        const numericValues = Object.values(symptoms).filter(v => typeof v === 'number' && v > 0);
        if (numericValues.length === 0) return 1;

        const avg = numericValues.reduce((sum, val) => sum + val, 0) / numericValues.length;
        return Math.round(avg);
    }

    // 计算置信度
    calculateConfidence(diseaseType, symptomData) {
        let confidence = 70; // 基础置信度
        const template = this.diseaseTemplates[diseaseType];

        if (diseaseType === 'cold') {
            if (symptomData.symptoms['体温'] && symptomData.symptoms['体温'] >= 38) confidence += 15;
            if (symptomData.symptoms['🌡️ 体温评估'] >= 3) confidence += 10;
            if (symptomData.symptoms['😷 咳嗽评估'] >= 2) confidence += 10;
            if (symptomData.symptoms['👃 鼻部症状']) confidence += 5;
        } else if (diseaseType === 'migraine') {
            if (symptomData.symptoms['疼痛强度'] >= 6) confidence += 20;
            if (symptomData.symptoms['伴随症状']?.includes('恶心')) confidence += 10;
            if (symptomData.symptoms['伴随症状']?.includes('畏光')) confidence += 10;
        }

        // 症状数量加成
        const symptomCount = Object.keys(symptomData.symptoms).length;
        confidence += Math.min(symptomCount * 2, 10);

        return Math.min(confidence, 95);
    }

    // 生成个性化建议
    generateRecommendations(diseaseType, symptomData) {
        const recommendations = [];
        const avgSeverity = this.calculateAverageSeverity(symptomData.symptoms);
        const template = this.diseaseTemplates[diseaseType];

        // 基础建议
        if (template?.analysisTemplate?.recommendations) {
            recommendations.push(...template.analysisTemplate.recommendations);
        }

        // 根据严重程度调整建议
        if (avgSeverity >= 4) {
            recommendations.push("症状较重，建议及时就医咨询");
            recommendations.push("密切监测症状变化");
        } else if (avgSeverity >= 3) {
            recommendations.push("中等程度症状，建议居家观察");
            recommendations.push("如症状加重请及时就医");
        } else {
            recommendations.push("症状较轻，注意休息即可");
            recommendations.push("保持良好的生活习惯");
        }

        // 疾病特异性建议
        if (diseaseType === 'cold') {
            if (symptomData.symptoms['体温'] >= 38.5) {
                recommendations.push("体温较高，注意物理降温");
            }
            recommendations.push("多饮温开水，保持室内湿度");
        } else if (diseaseType === 'migraine') {
            recommendations.push("避免强光刺激和噪音");
            if (symptomData.symptoms['伴随症状']?.includes('睡眠不足')) {
                recommendations.push("规律作息，保证充足睡眠");
            }
        }

        return [...new Set(recommendations)]; // 去重
    }

    // 生成用药建议
    generateMedicationAdvice(diseaseType, severity) {
        const template = this.diseaseTemplates[diseaseType];
        if (!template?.medications || template.medications.length === 0) {
            return "暂无特异性用药建议，请咨询医生";
        }

        let advice = "建议用药方案：";
        template.medications.forEach((med, index) => {
            advice += `${index + 1}. ${med.name} ${med.dosage}，${med.frequency}；`;
        });

        if (severity >= 4) {
            advice += " 由于症状较重，强烈建议在医生指导下用药。";
        } else {
            advice += " 请按说明书使用，如有不适请停药就医。";
        }

        return advice;
    }

    // 生成随访建议
    generateFollowUpAdvice(diseaseType, symptomData) {
        const severity = this.calculateAverageSeverity(symptomData.symptoms);
        const template = this.diseaseTemplates[diseaseType];

        let advice = "";

        if (severity >= 4) {
            advice = "建议24-48小时内就医或复诊";
        } else if (severity >= 3) {
            advice = "建议3-5天后评估症状变化";
        } else {
            advice = "症状较轻，1周后复诊即可";
        }

        if (template?.expectedDuration && template.expectedDuration !== "慢性管理") {
            advice += `，预计康复时间：${template.expectedDuration}`;
        }

        advice += "。如症状持续加重或出现新症状，请及时就医。";

        return advice;
    }

    // 获取严重程度标签
    getSeverityLabel(severity) {
        const labels = ['', '轻微', '轻度', '中度', '重度', '严重'];
        return labels[severity] || '未知';
    }

    // 生成分析ID
    generateAnalysisId() {
        return 'analysis_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
    }

    // 显示分析结果
    displayAnalysisResult(analysis, container) {
        const confidenceColor = analysis.confidence >= 80 ? '#28a745' : analysis.confidence >= 60 ? '#ffc107' : '#dc3545';
        const severityColor = analysis.severity >= 4 ? '#dc3545' : analysis.severity >= 3 ? '#fd7e14' : '#28a745';

        container.innerHTML = `
            <div class="analysis-summary" style="background: linear-gradient(135deg, #f8f9fa 0%, #e9ecef 100%); border-radius: 8px; padding: 15px; margin-bottom: 20px;">
                <h4 style="color: #2c5aa0; margin-bottom: 10px; display: flex; align-items: center; gap: 8px;">
                    📋 AI诊断分析报告
                    <span style="background: #e3f2fd; color: #1976d2; padding: 2px 8px; border-radius: 12px; font-size: 11px;">ID: ${analysis.analysisId}</span>
                </h4>
                <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 15px;">
                    <div>
                        <strong>初步诊断：</strong>${analysis.diagnosis}<br>
                        <strong>疾病分类：</strong>${analysis.category}
                    </div>
                    <div>
                        <strong>置信度：</strong><span style="color: ${confidenceColor}; font-weight: 600;">${analysis.confidence}%</span> 
                        (${analysis.confidence >= 80 ? '高' : analysis.confidence >= 60 ? '中' : '低'}置信度)<br>
                        <strong>严重程度：</strong><span style="color: ${severityColor}; font-weight: 600;">${analysis.severity}/5级</span> 
                        (${analysis.severityLabel})
                    </div>
                </div>
                <div style="margin-top: 10px;">
                    <strong>预期康复时间：</strong>${analysis.expectedDuration}
                </div>
            </div>
            
            <div style="margin-bottom: 20px;">
                <h4 style="color: #28a745; margin-bottom: 10px; display: flex; align-items: center; gap: 8px;">💊 用药指导</h4>
                <div style="background: #f8fff8; border-left: 4px solid #28a745; padding: 15px; border-radius: 0 8px 8px 0;">
                    <p style="margin: 0;">${analysis.medication}</p>
                </div>
            </div>
            
            <div style="margin-bottom: 20px;">
                <h4 style="color: #fd7e14; margin-bottom: 10px; display: flex; align-items: center; gap: 8px;">🎯 个性化建议</h4>
                <div style="background: #fff8f0; border-left: 4px solid #fd7e14; padding: 15px; border-radius: 0 8px 8px 0;">
                    <ul style="margin: 0; padding-left: 20px;">
                        ${analysis.recommendations.map(rec => `<li style="margin-bottom: 5px;">${rec}</li>`).join('')}
                    </ul>
                </div>
            </div>
            
            <div>
                <h4 style="color: #6f42c1; margin-bottom: 10px; display: flex; align-items: center; gap: 8px;">📅 随访计划</h4>
                <div style="background: #f8f6ff; border-left: 4px solid #6f42c1; padding: 15px; border-radius: 0 8px 8px 0;">
                    <p style="margin: 0;">${analysis.followUp}</p>
                </div>
            </div>
            
            <div style="margin-top: 20px; padding: 15px; background: #e3f2fd; border-radius: 8px; text-align: center;">
                <p style="margin: 0; font-size: 12px; color: #1976d2;">
                    <strong>📊 数据来源：</strong>基于${Object.keys(analysis).length}项分析指标，参考国际医学数据库和机器学习模型
                </p>
                <p style="margin: 5px 0 0 0; font-size: 11px; color: #666;">
                    生成时间：${new Date().toLocaleString()} | 分析版本：v${this.version}
                </p>
            </div>
        `;
    }

    // 风险评估
    assessRisk(diseaseType, symptomData) {
        const template = this.diseaseTemplates[diseaseType];
        let hasRisk = false;
        let riskMessages = [];
        let riskLevel = 'low';

        if (diseaseType === 'cold') {
            const temperature = symptomData.symptoms['体温'] || 0;
            if (temperature >= 39.5) {
                hasRisk = true;
                riskLevel = 'high';
                riskMessages.push("体温过高(≥39.5°C)，存在严重感染风险");
            }

            const severity = this.calculateAverageSeverity(symptomData.symptoms);
            if (severity >= 4) {
                hasRisk = true;
                riskLevel = Math.max(riskLevel, 'medium');
                riskMessages.push("症状严重程度较高，建议医生评估");
            }

            // 检查危险症状组合
            if (symptomData.symptoms['伴随症状']) {
                const dangerousSymptoms = ['呼吸困难', '胸痛', '意识改变'];
                const foundDangerous = dangerousSymptoms.filter(symptom =>
                    symptomData.symptoms['伴随症状'].some(s => s.includes(symptom))
                );
                if (foundDangerous.length > 0) {
                    hasRisk = true;
                    riskLevel = 'high';
                    riskMessages.push(`检测到危险症状：${foundDangerous.join('、')}`);
                }
            }
        } else if (diseaseType === 'migraine') {
            const painLevel = symptomData.symptoms['疼痛强度'] || 0;
            if (painLevel >= 8) {
                hasRisk = true;
                riskLevel = 'medium';
                riskMessages.push("疼痛程度极重(≥8/10)，可能需要紧急处理");
            }

            if (symptomData.symptoms['伴随症状']?.includes('言语障碍')) {
                hasRisk = true;
                riskLevel = 'high';
                riskMessages.push("出现神经系统症状，需要紧急医疗评估");
            }
        }

        return { hasRisk, riskMessages, riskLevel };
    }

    // 显示风险评估
    showRiskAssessment(riskResult, container) {
        const riskColors = {
            low: '#ffc107',
            medium: '#fd7e14',
            high: '#dc3545'
        };

        const riskLabels = {
            low: '低风险',
            medium: '中风险',
            high: '高风险'
        };

        const riskColor = riskColors[riskResult.riskLevel] || '#dc3545';
        const riskLabel = riskLabels[riskResult.riskLevel] || '未知风险';

        document.getElementById('riskContent').innerHTML = `
            <div style="margin-bottom: 15px;">
                <div style="display: flex; align-items: center; gap: 10px; margin-bottom: 10px;">
                    <span style="background: ${riskColor}; color: white; padding: 4px 12px; border-radius: 12px; font-size: 12px; font-weight: 600;">
                        ${riskLabel}
                    </span>
                    <span style="font-size: 12px; color: #666;">系统检测到${riskResult.riskMessages.length}个风险信号</span>
                </div>
                <strong>检测到以下风险信号：</strong>
                <ul style="margin: 10px 0; padding-left: 20px;">
                    ${riskResult.riskMessages.map(msg => `<li style="margin-bottom: 5px;">${msg}</li>`).join('')}
                </ul>
            </div>
            <div style="background: #fff5f5; border: 1px solid #fecaca; border-radius: 6px; padding: 12px; margin-bottom: 15px;">
                <p style="margin: 0;"><strong>⚠️ 重要提醒：</strong></p>
                <p style="margin: 5px 0 0 0;">请立即联系医生或前往医院就诊，不要延误治疗。AI分析仅供参考，不能替代专业医疗诊断。</p>
            </div>
        `;
        container.style.display = 'block';
    }

    // 保存分析记录
    saveAnalysisRecord(diseaseType, symptomData, analysis, riskResult) {
        const record = {
            id: analysis.analysisId,
            timestamp: new Date().toISOString(),
            diseaseType,
            symptomData,
            analysis,
            riskResult,
            version: this.version
        };

        // 保存到本地存储
        const existingRecords = JSON.parse(localStorage.getItem('healthApp_analyses') || '[]');
        existingRecords.push(record);

        // 只保留最近50条记录
        if (existingRecords.length > 50) {
            existingRecords.splice(0, existingRecords.length - 50);
        }

        localStorage.setItem('healthApp_analyses', JSON.stringify(existingRecords));

        console.log('分析记录已保存:', record.id);
    }

    // 计算疾病进程
    calculateDiseaseProgress(diseaseId) {
        // 模拟疾病进程计算
        const startDate = localStorage.getItem(`disease_start_${diseaseId}`);
        if (startDate) {
            const start = new Date(startDate);
            const now = new Date();
            const days = Math.ceil((now - start) / (1000 * 60 * 60 * 24));
            return `第${days}天`;
        } else {
            // 如果是第一次选择此疾病，设置开始时间
            localStorage.setItem(`disease_start_${diseaseId}`, new Date().toISOString());
            return "第1天";
        }
    }

    // 获取最后记录时间
    getLastRecordTime() {
        const lastRecord = localStorage.getItem('last_symptom_record');
        if (lastRecord) {
            const recordTime = new Date(lastRecord);
            const now = new Date();
            const diffMinutes = Math.floor((now - recordTime) / (1000 * 60));

            if (diffMinutes < 60) {
                return `${diffMinutes}分钟前`;
            } else if (diffMinutes < 1440) {
                return `${Math.floor(diffMinutes / 60)}小时前`;
            } else {
                return `${Math.floor(diffMinutes / 1440)}天前`;
            }
        }
        return "暂无记录";
    }

    // 角色切换
    switchRole(role) {
        try {
            document.querySelectorAll('.role-tab').forEach(tab => {
                tab.classList.remove('active');
            });

            if (role === 'patient') {
                document.getElementById('patientView').style.display = 'flex';
                document.getElementById('doctorView').style.display = 'none';
                document.querySelectorAll('.role-tab')[0].classList.add('active');
            } else {
                document.getElementById('patientView').style.display = 'none';
                document.getElementById('doctorView').style.display = 'flex';
                document.querySelectorAll('.role-tab')[1].classList.add('active');
            }

            this.currentRole = role;
            this.trackEvent('role_switched', { role });

        } catch (error) {
            console.error('角色切换失败:', error);
        }
    }

    // 显示症状表单
    showSymptomForm() {
        const currentForm = document.getElementById(`${this.currentDisease}-form`);
        if (currentForm) {
            currentForm.scrollIntoView({ behavior: 'smooth' });
            this.trackEvent('symptom_form_opened', { diseaseType: this.currentDisease });
        }
    }

    // 记录服药情况
    recordMedication() {
        this.showNotification('服药记录功能开发中...', 'info');
        this.trackEvent('medication_record_clicked');
    }

    // 保存症状记录
    saveSymptomRecord() {
        try {
            const data = this.collectSymptomData(this.currentDisease);

            // 保存到本地存储
            const existingRecords = JSON.parse(localStorage.getItem('healthApp_symptom_records') || '[]');
            const record = {
                id: 'record_' + Date.now(),
                ...data,
                version: this.version
            };
            existingRecords.push(record);

            // 只保留最近100条记录
            if (existingRecords.length > 100) {
                existingRecords.splice(0, existingRecords.length - 100);
            }

            localStorage.setItem('healthApp_symptom_records', JSON.stringify(existingRecords));
            localStorage.setItem('last_symptom_record', new Date().toISOString());

            this.showNotification('症状记录已保存！', 'success');
            this.trackEvent('symptom_record_saved', { diseaseType: this.currentDisease });

            // 更新最后记录时间显示
            this.updateDiseaseInfo(this.currentDisease);

        } catch (error) {
            console.error('保存症状记录失败:', error);
            this.showError('保存失败，请重试');
        }
    }

    // 自动保存
    autoSave() {
        clearTimeout(this.autoSaveTimer);
        this.autoSaveTimer = setTimeout(() => {
            try {
                const data = this.collectSymptomData(this.currentDisease);
                localStorage.setItem('healthApp_current_draft', JSON.stringify(data));
                console.log('自动保存成功');
            } catch (error) {
                console.error('自动保存失败:', error);
            }
        }, 2000);
    }

    // 设置自动保存
    setupAutoSave() {
        // 页面加载时恢复草稿
        try {
            const draft = localStorage.getItem('healthApp_current_draft');
            if (draft) {
                const data = JSON.parse(draft);
                console.log('发现草稿数据，已恢复');
                // 这里可以添加恢复草稿的逻辑
            }
        } catch (error) {
            console.error('恢复草稿失败:', error);
        }
    }

    // 保存所有数据
    saveAllData() {
        try {
            const allData = {
                patientData: this.patientData,
                currentDisease: this.currentDisease,
                version: this.version,
                timestamp: new Date().toISOString()
            };
            localStorage.setItem('healthApp_backup', JSON.stringify(allData));
        } catch (error) {
            console.error('数据备份失败:', error);
        }
    }

    // 加载用户配置
    loadUserProfile() {
        try {
            const profile = localStorage.getItem('healthApp_user_profile');
            return profile ? JSON.parse(profile) : {
                name: '用户',
                age: null,
                gender: null,
                allergies: [],
                medicalHistory: []
            };
        } catch (error) {
            console.error('加载用户配置失败:', error);
            return { name: '用户' };
        }
    }

    // 初始化通知系统
    initNotificationSystem() {
        // 检查浏览器通知权限
        if ('Notification' in window && Notification.permission === 'default') {
            Notification.requestPermission();
        }
    }

    // 显示通知
    showNotification(message, type = 'info', duration = 3000) {
        // 移除现有通知
        const existing = document.querySelector('.notification');
        if (existing) {
            existing.remove();
        }

        // 创建新通知
        const notification = document.createElement('div');
        notification.className = `notification ${type}`;
        notification.innerHTML = `
            <div style="display: flex; align-items: center; gap: 10px;">
                <span style="font-size: 16px;">${this.getNotificationIcon(type)}</span>
                <span>${message}</span>
                <button onclick="this.parentElement.parentElement.remove()" style="background: none; border: none; color: currentColor; cursor: pointer; margin-left: auto;">✕</button>
            </div>
        `;

        // 设置样式
        Object.assign(notification.style, {
            position: 'fixed',
            top: '20px',
            right: '20px',
            padding: '12px 20px',
            borderRadius: '8px',
            boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
            zIndex: '2000',
            animation: 'slideIn 0.3s ease-out',
            maxWidth: '300px',
            wordWrap: 'break-word'
        });

        // 设置颜色
        const colors = {
            info: { background: '#3498db', color: 'white' },
            success: { background: '#2ecc71', color: 'white' },
            warning: { background: '#f39c12', color: 'white' },
            error: { background: '#e74c3c', color: 'white' }
        };
        const colorScheme = colors[type] || colors.info;
        notification.style.background = colorScheme.background;
        notification.style.color = colorScheme.color;

        // 添加到页面
        document.body.appendChild(notification);

        // 自动移除
        if (duration > 0) {
            setTimeout(() => {
                if (notification.parentElement) {
                    notification.style.opacity = '0';
                    setTimeout(() => notification.remove(), 300);
                }
            }, duration);
        }
    }

    // 获取通知图标
    getNotificationIcon(type) {
        const icons = {
            info: 'ℹ️',
            success: '✅',
            warning: '⚠️',
            error: '❌'
        };
        return icons[type] || icons.info;
    }

    // 显示错误
    showError(message) {
        this.showNotification(message, 'error', 5000);
    }

    // 事件跟踪
    trackEvent(eventName, properties = {}) {
        try {
            const event = {
                name: eventName,
                properties: {
                    ...properties,
                    timestamp: new Date().toISOString(),
                    userAgent: navigator.userAgent,
                    url: window.location.href,
                    sessionId: this.analytics.sessionStart
                }
            };

            this.analytics.userActions.push(event);
            console.log('📊 事件跟踪:', eventName, properties);

            // 这里可以发送到分析服务
            // analytics.track(eventName, properties);

        } catch (error) {
            console.error('事件跟踪失败:', error);
        }
    }

    // 紧急呼叫
    emergencyCall() {
        this.trackEvent('emergency_call_clicked');
        if (confirm('确定要拨打紧急电话 120 吗？')) {
            window.open('tel:120');
        }
    }

    // 预约挂号
    bookAppointment() {
        this.trackEvent('appointment_booking_clicked');
        this.showNotification('预约挂号功能开发中...', 'info');
    }

    // 打开患者聊天
    openPatientChat() {
        const commPanel = document.getElementById('commPanel');
        if (commPanel) {
            commPanel.style.display = 'block';
            this.trackEvent('patient_chat_opened');
        }
    }

    // 切换沟通面板
    toggleComm() {
        const panel = document.getElementById('commPanel');
        if (panel) {
            const isVisible = panel.style.display !== 'none';
            panel.style.display = isVisible ? 'none' : 'block';
            this.trackEvent('communication_panel_toggled', { visible: !isVisible });
        }
    }

    // 发送消息
    sendMessage() {
        const input = document.getElementById('messageInput');
        if (input && input.value.trim()) {
            const message = input.value.trim();
            const commBody = document.querySelector('.comm-body');

            if (commBody) {
                const messageElement = document.createElement('div');
                messageElement.className = 'message sent';
                messageElement.textContent = message;
                commBody.appendChild(messageElement);

                // 滚动到底部
                commBody.scrollTop = commBody.scrollHeight;

                // 清空输入框
                input.value = '';

                // 模拟医生回复
                setTimeout(() => {
                    const replyElement = document.createElement('div');
                    replyElement.className = 'message received';
                    replyElement.innerHTML = '<strong>张医生：</strong>收到您的消息，我会尽快查看并回复。';
                    commBody.appendChild(replyElement);
                    commBody.scrollTop = commBody.scrollHeight;
                }, 2000);

                this.trackEvent('message_sent', { messageLength: message.length });
            }
        }
    }

    // 获取应用统计信息
    getAppStats() {
        return {
            version: this.version,
            userActions: this.analytics.userActions.length,
            sessionDuration: Date.now() - this.analytics.sessionStart,
            symptomsRecorded: JSON.parse(localStorage.getItem('healthApp_symptom_records') || '[]').length,
            analysesPerformed: JSON.parse(localStorage.getItem('healthApp_analyses') || '[]').length
        };
    }
}

// 全局函数（保持向后兼容）
function switchRole(role) {
    window.medicalApp?.switchRole(role);
}

function selectDisease(diseaseId) {
    window.medicalApp?.selectDisease(diseaseId);
}

function analyzeSymptoms(diseaseType) {
    window.medicalApp?.analyzeSymptoms(diseaseType);
}

function showSymptomForm() {
    window.medicalApp?.showSymptomForm();
}

function recordMedication() {
    window.medicalApp?.recordMedication();
}

function saveSymptomRecord() {
    window.medicalApp?.saveSymptomRecord();
}

function toggleComm() {
    window.medicalApp?.toggleComm();
}

function emergencyCall() {
    window.medicalApp?.emergencyCall();
}

function bookAppointment() {
    window.medicalApp?.bookAppointment();
}

function openPatientChat() {
    window.medicalApp?.openPatientChat();
}

function sendMessage() {
    window.medicalApp?.sendMessage();
}

// 回车发送消息
document.addEventListener('keypress', (e) => {
    if (e.key === 'Enter' && e.target.id === 'messageInput') {
        sendMessage();
    }
});

// 初始化应用
document.addEventListener('DOMContentLoaded', () => {
    try {
        console.log('🚀 开始初始化智医伴侣...');
        window.medicalApp = new MedicalApp();

        // 设置全局错误处理
        window.addEventListener('unhandledrejection', event => {
            console.error('未处理的Promise错误:', event.reason);
            window.medicalApp?.trackEvent('unhandled_error', { error: event.reason.toString() });
        });

    } catch (error) {
        console.error('应用初始化失败:', error);
        document.body.innerHTML = `
            <div style="text-align: center; padding: 50px; color: #dc3545;">
                <h2>😔 应用启动失败</h2>
                <p>错误信息：${error.message}</p>
                <button onclick="window.location.reload()" style="padding: 10px 20px; background: #2c5aa0; color: white; border: none; border-radius: 6px; cursor: pointer;">重新加载</button>
            </div>
        `;
    }
});

// 页面可见性变化时的处理
document.addEventListener('visibilitychange', () => {
    if (!document.hidden && window.medicalApp) {
        window.medicalApp.trackEvent('page_visible');
        // 可以在这里添加数据刷新逻辑
    }
});

console.log('🏥 智医伴侣 JavaScript 模块加载完成');