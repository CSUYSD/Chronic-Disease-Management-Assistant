# Multi-Agent Chronic Disease Monitoring Software System

## 1. Background🌍

In the post-pandemic era, rapid advancements in AI technology have led to significant growth in biomedicine, addressing increasingly complex diseases. This progress has heightened societal expectations for managing common chronic conditions. The recent pandemic has also intensified global health awareness, prompting individuals and groups to prioritize well-being.

Metabolic Syndrome (MetS), a major threat to human health, is associated with increased risks of all-cause mortality, heart disease, and diabetes. In the current era, MetS poses even greater health challenges. Patients are increasingly dissatisfied with the need for in-person visits for routine health checkups, coupled with high costs and long waiting times, highlighting a significant market gap.

The ability to monitor routine healthcare data—such as blood pressure, blood glucose, and blood counts—through a smartwatch would be transformative, driving the motivation behind this project.

Our goal is to develop a multi-agent chronic disease monitoring software system that can:
- Monitor patients' health status in real-time
- Provide personalized health management advice
- Offer caregivers access to patients' health data for improved care

## 2. Primary Users and Roles👨

- **Patients** 😷: Chronic disease patients lacking self-health management awareness
- **Companions** 🥼: People with close relationships to the patients
- **Technical Team** 🧑‍💻: Responsible for maintaining and improving the system's robustness and timeliness

## 3. Core Functions 🚀

### 3.1 Health Records (Historical Data)
- Record patient health status through input or monitoring hardware
- Agent team analyzes overall health status and provides recommendations
- Generate time-span based visualized health data analysis

### 3.2 Emotional Support
- Agent team reports to the psychologist and provides corresponding emotional support

### 3.3 Health Consultation
- Active interaction where the Agent team provides medical advice based on patient input and recent condition

### 3.4 Indicator Monitoring
- Real-time query of patient health status, including psychological condition and physiological indicators
- Generate analysis reports for medical use through the Agent
- Issue standardized reminders at different levels for abnormal monitoring indicators

### 3.5 Sub-accounts
- Caregiver accounts can connect to one or more (paid) patient accounts

### 3.6 Short Videos
- Users can watch short videos provided by the team to gain health knowledge

### 3.7 User Permission Management
- Users can manage their account information, including personal information and health data
- Users can manage their caregiver information, including caregiver details and permissions

## 4. Non-functional Requirements🔒

### 4.1 Security
- Proper protection of users' health data and personal information against leakage using Spring Security

### 4.2 Loose Coupling
- Maintain loose coupling between system components for easy expansion and maintenance

## 5. 4 + 1 View Model📊

### 5.1 Scenario View
a. Feature Diagram
![5620 diagram - Page 1 (4)](https://github.com/user-attachments/assets/378b39ae-99da-45a3-b5c9-a20331cddcc3)
b. Use Case Diagram
![5620 diagram - Page 1 (1)](https://github.com/user-attachments/assets/71c1e6e3-8c3f-4654-be87-4a28351119a4)

### 5.2 Logical View
a.Class Diagram
![5620 diagram - Page 1 (3)](https://github.com/user-attachments/assets/a7694731-6436-4735-8a69-bc5ad083129a)
b.Object Diagram
![5620 diagram - Page 1 (2)](https://github.com/user-attachments/assets/62a5453a-fe37-4944-b9fb-2452a2a79eda)

### 5.3 Development View

### 5.4 Physical View

### 5.5 Process View

## 6. Technology Stack

### 6.1 Frontend
- React Native: For cross-platform mobile app development
- Redux: For state management
- Axios: For handling HTTP requests

### 6.2 Backend
- Spring Boot 3: For building backend services
- FAST API: Handled one-way communication, transmitting AI-generated content to the frontend.
- RabbitMQ: Backend component communication
- Spring Security 6: For handling authentication and authorization
- Hibernate: For database operations
- PSQL: As the primary database
- Redis: For caching and session management

### 6.4 DevOps and Cloud Services
- Docker: For containerizing applications
- Kubernetes: For container orchestration and management
- AWS or Alibaba Cloud: For cloud hosting and services

### 6.5 Monitoring and Logging
- Prometheus: For system monitoring
- Grafana: For data visualization
- ELK Stack (Elasticsearch, Logstash, Kibana): For log management and analysis
