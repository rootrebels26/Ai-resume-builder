import re
import json

aditya_ocr = """Aditya Chandak
Azure Data Engineer | Data Solution Architect
Email Adityachandak451@gmail.com
Contact +91 8879994576
LinkedIn https://www.linkedin.com/in/aditya-chandak-24692825/
Azure Data Engineer | Data Solution Architect 
Data Solution Architect with 10+ years of experience designing and delivering enterprise-scale data platforms using Microsoft Fabric, Azure Databricks, Azure Data Factory, Synapse Analytics, and Power BI. Experienced in Lakehouse Architecture, Data Warehousing, Data Governance, Data Modeling, ETL/ELT Pipelines, Unity Catalog, and Azure Cloud. Proven ability to lead cross-functional teams, define enterprise architecture, mentor engineering teams, and deliver scalable, secure, and high-performance analytics solutions across Manufacturing, Retail, and Financial domains.
Core Technical Skills
Cloud & Data Platforms: Microsoft Fabric, Azure Databricks, Azure Synapse Analytics, Azure Data Factory (ADF), Snowflake, Azure Data Lake Storage Gen2 (ADLS Gen2), Cosmos DB
Solution & Data Architecture: Enterprise Data Architecture, Solution Architecture, Lakehouse Architecture, Medallion Architecture, Data Warehousing, Dimensional Modeling, High-Level Design (HLD), Low-Level Design (LLD)
Data Governance & Security: Azure Purview, Unity Catalog, Data Governance, Data Lineage, Role-Based Access Control (RBAC), Data Security, Compliance
Data Engineering & Analytics: Python, PySpark, Spark SQL, Databricks, Delta Lake, ETL/ELT Pipelines, GenAI (Copilot)
Visualizations Reporting: Power BI, SSRS
Programming & Databases: Python, SQL, Spark SQL, NoSQL
Tools DevOps: Git, Azure DevOps, Jenkins, Jira, Confluence, Visual Studio, Microsoft Fabric & Databricks Notebooks
Experience
Brillio | Data Solution Architect | Sep 2025 – March-2026| Bangalore, India
• Designed and implemented enterprise Data Governance frameworks using Unity Catalog, improving data security, compliance, and data lineage across Microsoft Fabric environments.
• Optimized Fabric, ADF, Databricks data pipelines, implemented proactive monitoring with custom alerting systems to ensure seamless data lifecycle management and high-quality data delivery.
• Utilized Fabric’s variable libraries for parameterized and reusable workflows, improving pipeline efficiency and maintainability.
Mastek International | Data Solution Architect | Feb 2025 – Sep 2025| Delhi, India
• Designed and implemented end-to-end data architecture in Microsoft Fabric, enabling seamless data ingestion, transformation, and integration across multiple data sources.
• Architected and optimized enterprise Data Pipelines, Dataflows Gen2, and Microsoft Fabric Notebooks to automate ETL/ELT workflows and improve data processing performance.
• Developed data governance policies for compliance, ensuring the protection of sensitive information and adherence to data security with flow in Unity Catalog.
Harman Connected | Data Architect | Feb 2024 – Nov 2024| Gurgaon, India
• Collaborated with engineering teams to document like HLD, LLD, DACI matrix in Confluence and Grooming in Jira.
• Integrated Azure Data Factory and Azure Databricks within Fabric for advanced ETL, orchestration, and data transformation.
• Collaborated with business stakeholders, architects, and engineering teams to define solution architecture, gather requirements, and deliver scalable enterprise data solutions.
• Designed and implemented end-to-end data architecture in Microsoft Fabric and Power BI, enabling seamless data ingestion, transformation, modeling, and visualization across multiple data sources
Orcapod (HPE Client) | Azure Data Architect | Mar2022 - Jan 2023 | Gurgaon, India
• Developed and maintained scalable data pipelines on Databricks, automating data ingestion and transformation processes.
• Designed and implemented modern data lake solutions using Azure Data Lake Storage (ADLS) and Databricks, enabling scalable data ingestion and analytics.
• Created automated workflows with the help of triggers
R System International | Azure Data Architect | May 2021 – Feb 2022 | Noida, India
• Designed scalable Lakehouse Architectures using Azure Data Lake Storage (ADLS Gen2) and Azure Databricks for enterprise analytics and real-time data processing.
• Built and orchestrated ETL/ELT pipelines in Azure Data Factory (ADF), processing multi-gigabyte datasets from diverse on-prem and cloud sources.
• Formulate data integration blueprints for business units and manufacturing plant, warehouses.
Nagarro | Technical Lead | Jun 2019 – Nov 2020 | Gurgaon, India
• Interacting with the client to understand requirements and make design decisions along with the architect.
• Designed enterprise Business Intelligence solutions using Power BI, Azure Data Factory, Azure Databricks, and SSAS, enabling scalable reporting and analytics.
• Hands on experience in DWH/BI Profile using Microsoft (MSBI) Technologies.
Airo Digital Labs | Technical Lead | Nov 2018 - May 2019 | Gurgaon, India
• Designing and developing Complex Power BI Dashboard.
• Designed and implemented scalable Azure Data Factory pipelines for automated data ingestion, orchestration, and enterprise ETL processing.
• Creating Azure Analysis services instance for analyzing the data in the required view.
Sterling Talent Solution | Senior Software Engineer| Sep 2017 - Jun 2018 | Mumbai, India
• Designed and implemented data models, data flows, and reports using SSAS, SSIS, and SSRS for clients in the chemical and airline industry.
• Created and maintained SQL queries for reporting, supporting business intelligence functions with real-time insights and optimized data performance.
Mastek Private ltd | IT Analyst | Jun 2014 - Sep 2017 | Mumbai, India
• Interact with various development teams, project managers, internal and external customers, and senior management
• Created and maintained SQL queries for reporting, supporting business intelligence functions with real-time insights and optimized data performance.
Leaderships Interpersonal Skills
• Leaderships Mentorship: mentoring and engineering teams, fostering a culture of continuous improvement and innovation.
• Stakeholder Engagement: Building strong relationships with business stakeholders to align data solutions with strategic objectives and deliver impactful results.
• Collaboration s Co-creation: Driving cross functional teams to co create data solutions that enhance business value and support long term growth.
• Strategic Vision: Leading the definition of data strategies and roadmaps, from conceptualization to execution, to support evolving business needs and digital transformation.
Education
• Bachelor of Engineering (Information and Technology) – 2010 RGPV, Bhopal
"""

if __name__ == "__main__":
    from app.providers.local_heuristic import LocalHeuristicProvider
    from app.services.resume_parser import sanitize_and_hydrate_resume

    provider = LocalHeuristicProvider()
    raw_dict = provider.parse_resume_document_sync(aditya_ocr)
    resume = sanitize_and_hydrate_resume(raw_dict, raw_text=aditya_ocr)

    print("NAME:", resume.personalInfo.fullName)
    print("PHONE:", resume.personalInfo.phone)
    print("EMAIL:", resume.personalInfo.email)
    print("LOCATION:", resume.personalInfo.location)
    print("TITLE:", resume.personalInfo.professionalTitle)
    print("LINKEDIN:", resume.personalInfo.linkedin)
    print("EXPERIENCE COUNT:", len(resume.experience))
    for i, exp in enumerate(resume.experience):
        print(f"  [{i+1}] {exp.company} | {exp.position} | {exp.startDate} - {exp.endDate} | {exp.location} ({len(exp.responsibilities)} bullets)")
    print("SKILLS COUNT:", len(resume.skills))
    for sc in resume.skills:
        print(f"  {sc.category}: {len(sc.items)} items -> {sc.items[:3]}")
    print("EDUCATION COUNT:", len(resume.education))
    for edu in resume.education:
        print(f"  {edu.degree} @ {edu.institution} ({edu.endDate})")
