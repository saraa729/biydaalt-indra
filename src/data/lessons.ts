import { Lesson } from '../types';

export const lessons: Lesson[] = [
  {
    tag: "Advanced",
    title: "Ethical Hacking & Penetration Testing",
    description: "Master the art of pentesting: Learn to bypass firewalls, exploit systems, and secure networks like a professional.",
    duration: "8 WEEKS",
    detailedExplanation: `This comprehensive 8-week program covers ethical hacking methodologies from beginner to advanced. You'll learn:
    
• Footprinting and reconnaissance techniques
• Scanning and enumeration using tools like Nmap
• Vulnerability assessment and exploitation
• Web application security testing
• Network penetration testing
• Wireless network security assessment
• Social engineering tactics and countermeasures
• Report writing and documentation

By the end of the program, you'll have hands-on experience with industry-standard tools and be prepared for certifications like CEH, OSCP, or Pentest+.`
  },
  {
    tag: "Foundational",
    title: "Infrastructure & Network Security",
    description: "Defend and fortify enterprise networks, cloud infrastructures, and critical digital assets against advanced threats.",
    duration: "12 WEEKS",
    detailedExplanation: `This 12-week foundational program focuses on securing modern IT infrastructures:
    
• Network security fundamentals and protocols
• Firewall configuration and management
• VPN implementation and secure remote access
• Cloud security (AWS, Azure, GCP)
• Zero trust architecture principles
• Intrusion Detection/Prevention Systems (IDS/IPS)
• Security Information and Event Management (SIEM)
• Incident response and disaster recovery planning
• Secure network design principles

Ideal for beginners or IT professionals looking to transition into cybersecurity.`
  },
  {
    tag: "Specialized",
    title: "Digital Forensics & Incident Response",
    description: "Investigate breaches, analyze evidence, and lead incident response operations for major security events.",
    duration: "10 WEEKS",
    detailedExplanation: `Learn to investigate cybersecurity incidents and preserve digital evidence:
    
• Digital forensics fundamentals
• Forensic acquisition and analysis
• Memory forensics
• Malware analysis basics
• Incident response lifecycle
• Chain of custody and legal considerations
• Forensic tools and techniques
• Reporting and expert testimony
• Case studies of major breaches

Perfect for those interested in law enforcement, consulting, or in-house security teams.`
  },
  {
    tag: "Advanced",
    title: "Cloud Security Architecture",
    description: "Design and implement secure cloud environments with best practices for AWS, Azure, and GCP platforms.",
    duration: "10 WEEKS",
    detailedExplanation: `Specialized program focusing on cloud security:
    
• Cloud service models (IaaS, PaaS, SaaS)
• Identity and Access Management (IAM) in cloud
• Cloud network security and segmentation
• Container security (Docker, Kubernetes)
• Serverless security
• Compliance and governance
• Cloud security monitoring and logging
• Threat detection in cloud environments
• Cost optimization while maintaining security

Learn to secure enterprise cloud deployments and earn certifications like AWS Security, Azure Security, or GCP Professional Cloud Security Engineer.`
  },
  {
    tag: "Foundational",
    title: "Cybersecurity Fundamentals",
    description: "Start your cybersecurity journey with essential concepts, terminology, and hands-on basic skills.",
    duration: "6 WEEKS",
    detailedExplanation: `Perfect for beginners, this 6-week program covers:
    
• Introduction to cybersecurity principles
• Common threats and vulnerabilities
• Basic networking concepts
• Operating system security
• Introduction to cryptography
• Security policies and procedures
• Basic security tools
• Cybersecurity career paths and certifications
• Hands-on lab exercises

No prior IT experience required—beginner-friendly and designed to build a strong foundation!`
  },
  {
    tag: "Specialized",
    title: "Malware Analysis & Reverse Engineering",
    description: "Dive deep into understanding, analyzing, and reversing malicious software to defend against attacks.",
    duration: "14 WEEKS",
    detailedExplanation: `Advanced program for those interested in malware analysis:
    
• Malware types and propagation methods
• Static analysis techniques
• Dynamic analysis using sandboxes
• Assembly language fundamentals
• Debugging and reverse engineering tools
• Anti-reverse engineering tactics
• Malware behavior analysis
• Signature development
• Automated malware analysis

For experienced programmers and security professionals looking to specialize in malware defense.`
  }
];
