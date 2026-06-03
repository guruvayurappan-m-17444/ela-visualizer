import json
import logging
import random
import datetime
from io import StringIO

logger = logging.getLogger()
logger.setLevel(logging.INFO)


def handler(request, response):
    """Main handler for Catalyst Advanced I/O function."""
    try:
        method = request.get("method", "GET")
        url = request.get("url", "")
        path = url.split("/server/")[-1] if "/server/" in url else url
        body = request.get("body", {})

        # Route requests
        if "log-collection" in path:
            result = handle_log_collection(body)
        elif "log-parsing" in path:
            result = handle_log_parsing(body)
        elif "alerting" in path:
            result = handle_alerting(body)
        elif "reporting" in path:
            result = handle_reporting(body)
        elif "compliance" in path:
            result = handle_compliance(body)
        elif "correlation" in path:
            result = handle_correlation(body)
        elif "health" in path:
            result = {"status": "ok", "service": "ELA Visualizer API", "version": "1.0.0"}
        else:
            result = {"error": "Unknown endpoint", "available": [
                "log-collection", "log-parsing", "alerting",
                "reporting", "compliance", "correlation", "health"
            ]}

        response.set_content_type("application/json")
        response.set_status(200)
        response.send(json.dumps({"data": result}))

    except Exception as e:
        logger.error(f"Error: {str(e)}")
        response.set_content_type("application/json")
        response.set_status(500)
        response.send(json.dumps({"error": str(e)}))


# ─── Log Collection ────────────────────────────────────────────────

def handle_log_collection(body):
    method = body.get("method", "agent")
    count = body.get("count", 10)
    source_type = body.get("source_type", "windows")

    logs = generate_sample_logs(source_type, count)

    return {
        "method": method,
        "source_type": source_type,
        "logs_collected": len(logs),
        "collection_time_ms": random.randint(100, 3000),
        "status": "success",
        "logs": logs,
        "metadata": {
            "agent_version": "12.0.1",
            "compression": "gzip",
            "encryption": "TLS 1.3",
            "batch_id": f"BATCH-{random.randint(10000,99999)}",
        }
    }


def generate_sample_logs(source_type, count):
    logs = []
    base_time = datetime.datetime.now()

    generators = {
        "windows": generate_windows_log,
        "linux": generate_linux_log,
        "firewall": generate_firewall_log,
        "cloud": generate_cloud_log,
    }

    gen = generators.get(source_type, generate_windows_log)
    for i in range(min(count, 50)):
        timestamp = base_time - datetime.timedelta(seconds=random.randint(0, 3600))
        logs.append(gen(timestamp, i))

    return logs


def generate_windows_log(ts, idx):
    events = [
        {"id": 4624, "type": "Logon Success", "user": "john.doe"},
        {"id": 4625, "type": "Logon Failure", "user": "admin"},
        {"id": 4634, "type": "Logoff", "user": "jane.smith"},
        {"id": 4720, "type": "Account Created", "user": "new.user"},
        {"id": 4726, "type": "Account Deleted", "user": "old.user"},
        {"id": 7045, "type": "Service Installed", "user": "SYSTEM"},
    ]
    evt = random.choice(events)
    return {
        "timestamp": ts.isoformat(),
        "event_id": evt["id"],
        "event_type": evt["type"],
        "source": "Microsoft-Windows-Security-Auditing",
        "user": f"DOMAIN\\{evt['user']}",
        "workstation": f"WS-{random.randint(1,50):03d}",
        "source_ip": f"192.168.1.{random.randint(1,254)}",
    }


def generate_linux_log(ts, idx):
    processes = ["sshd", "sudo", "cron", "systemd", "httpd"]
    messages = [
        "Accepted password for user from {ip} port {port} ssh2",
        "Failed password for invalid user root from {ip} port {port} ssh2",
        "session opened for user admin by (uid=0)",
        "Started Daily apt download activities",
        "GET /index.html HTTP/1.1 200 4523",
    ]
    return {
        "timestamp": ts.isoformat(),
        "hostname": f"srv-{random.randint(1,20):02d}",
        "process": random.choice(processes),
        "pid": random.randint(1000, 65535),
        "message": random.choice(messages).format(
            ip=f"10.0.{random.randint(0,10)}.{random.randint(1,254)}",
            port=random.randint(30000, 65535)
        ),
    }


def generate_firewall_log(ts, idx):
    actions = ["Built", "Teardown", "Denied"]
    protocols = ["TCP", "UDP", "ICMP"]
    return {
        "timestamp": ts.isoformat(),
        "hostname": f"fw-{random.randint(1,5):02d}",
        "device_type": "Cisco ASA",
        "action": random.choice(actions),
        "protocol": random.choice(protocols),
        "src_ip": f"203.0.113.{random.randint(1,254)}",
        "src_port": random.randint(1024, 65535),
        "dst_ip": f"192.168.1.{random.randint(1,254)}",
        "dst_port": random.choice([22, 80, 443, 3389, 8080]),
    }


def generate_cloud_log(ts, idx):
    events = [
        {"name": "ConsoleLogin", "source": "signin.amazonaws.com"},
        {"name": "CreateBucket", "source": "s3.amazonaws.com"},
        {"name": "RunInstances", "source": "ec2.amazonaws.com"},
        {"name": "PutObject", "source": "s3.amazonaws.com"},
        {"name": "DeleteSecurityGroup", "source": "ec2.amazonaws.com"},
    ]
    evt = random.choice(events)
    return {
        "timestamp": ts.isoformat(),
        "event_name": evt["name"],
        "event_source": evt["source"],
        "region": random.choice(["us-east-1", "eu-west-1", "ap-south-1"]),
        "user": f"iam-user-{random.randint(1,10)}",
        "source_ip": f"203.0.113.{random.randint(1,254)}",
        "result": random.choice(["Success", "Success", "Failure"]),
    }


# ─── Log Parsing ──────────────────────────────────────────────────

def handle_log_parsing(body):
    raw_log = body.get("raw_log", "")
    log_type = body.get("log_type", "auto")

    if not raw_log:
        raw_log = "Mar 15 10:25:12 web-server-01 sshd[2847]: Failed password for invalid user root from 203.0.113.50 port 44231 ssh2"

    parsed = {
        "timestamp": datetime.datetime.now().isoformat(),
        "parsing_engine": "ELA Universal Parser v12.0",
        "format_detected": "Syslog (RFC 5424)",
        "fields_extracted": random.randint(8, 20),
        "normalization_applied": True,
        "parsed_fields": {
            "timestamp": "2024-03-15T10:25:12.000Z",
            "hostname": "web-server-01",
            "process": "sshd",
            "pid": 2847,
            "event_type": "Authentication Failure",
            "user": "root",
            "source_ip": "203.0.113.50",
            "source_port": 44231,
            "protocol": "ssh2",
            "severity": "Warning",
            "normalized_action": "USER_LOGON_FAILED",
        },
        "indexing": {
            "indexed": True,
            "index_time_ms": random.randint(1, 10),
            "searchable_fields": ["hostname", "process", "user", "source_ip", "event_type"],
        }
    }

    return parsed


# ─── Alerting ─────────────────────────────────────────────────────

def handle_alerting(body):
    alert_type = body.get("alert_type", "brute-force")
    threshold = body.get("threshold", 5)

    alerts_db = {
        "brute-force": {
            "name": "Brute Force Attack Detection",
            "severity": "Critical",
            "condition": f"Failed logons > {threshold} in 5 min from same IP",
            "triggered": True,
            "events_matched": random.randint(5, 25),
        },
        "privilege-escalation": {
            "name": "Privilege Escalation Alert",
            "severity": "High",
            "condition": "User added to privileged group",
            "triggered": True,
            "events_matched": random.randint(1, 3),
        },
        "service-stop": {
            "name": "Critical Service Stopped",
            "severity": "Medium",
            "condition": "Critical service state changed to Stopped",
            "triggered": True,
            "events_matched": 1,
        },
    }

    alert = alerts_db.get(alert_type, alerts_db["brute-force"])
    alert["timestamp"] = datetime.datetime.now().isoformat()
    alert["notifications_sent"] = [
        {"channel": "Email", "recipient": "soc-team@company.com", "status": "delivered"},
        {"channel": "SMS", "recipient": "+1-555-0123", "status": "delivered"},
    ]

    return alert


# ─── Reporting ────────────────────────────────────────────────────

def handle_reporting(body):
    report_type = body.get("report_type", "security")
    date_range = body.get("date_range", "last_7_days")

    return {
        "report_name": f"{report_type.title()} Summary Report",
        "date_range": date_range,
        "generated_at": datetime.datetime.now().isoformat(),
        "format": body.get("format", "PDF"),
        "summary": {
            "total_events": random.randint(50000, 500000),
            "critical_alerts": random.randint(5, 50),
            "high_alerts": random.randint(20, 100),
            "medium_alerts": random.randint(50, 200),
            "sources_active": random.randint(20, 100),
        },
        "top_events": [
            {"event": "Logon Success", "count": random.randint(10000, 50000)},
            {"event": "Logon Failure", "count": random.randint(500, 5000)},
            {"event": "Object Access", "count": random.randint(2000, 20000)},
            {"event": "Policy Change", "count": random.randint(100, 1000)},
            {"event": "Service State Change", "count": random.randint(50, 500)},
        ],
        "charts_generated": 4,
    }


# ─── Compliance ───────────────────────────────────────────────────

def handle_compliance(body):
    standard = body.get("standard", "PCI-DSS")

    standards_data = {
        "PCI-DSS": {"total_requirements": 12, "covered": 10, "partial": 2},
        "HIPAA": {"total_requirements": 8, "covered": 7, "partial": 1},
        "SOX": {"total_requirements": 5, "covered": 4, "partial": 1},
        "GDPR": {"total_requirements": 10, "covered": 8, "partial": 2},
        "FISMA": {"total_requirements": 6, "covered": 5, "partial": 1},
        "ISO-27001": {"total_requirements": 14, "covered": 12, "partial": 2},
    }

    data = standards_data.get(standard, standards_data["PCI-DSS"])

    return {
        "standard": standard,
        "assessment_date": datetime.datetime.now().isoformat(),
        "coverage": data,
        "coverage_percentage": round(
            (data["covered"] / data["total_requirements"]) * 100, 1
        ),
        "reports_available": random.randint(15, 50),
        "last_audit_finding": "No critical gaps",
        "next_audit_date": "2024-06-15",
    }


# ─── Correlation ──────────────────────────────────────────────────

def handle_correlation(body):
    rule_id = body.get("rule_id", "brute-force-rdp")
    events = body.get("events", [])

    correlation_results = {
        "brute-force-rdp": {
            "threat": "Brute Force Attack via RDP",
            "confidence": 95,
            "severity": "Critical",
            "events_correlated": 3,
        },
        "lateral-movement": {
            "threat": "Lateral Movement Detected",
            "confidence": 88,
            "severity": "Critical",
            "events_correlated": 3,
        },
        "data-exfiltration": {
            "threat": "Potential Data Exfiltration",
            "confidence": 92,
            "severity": "High",
            "events_correlated": 3,
        },
        "insider-threat": {
            "threat": "Insider Threat - Privilege Abuse",
            "confidence": 96,
            "severity": "Critical",
            "events_correlated": 3,
        },
    }

    result = correlation_results.get(rule_id, correlation_results["brute-force-rdp"])
    result["timestamp"] = datetime.datetime.now().isoformat()
    result["rule_id"] = rule_id
    result["engine_version"] = "3.5.2"
    result["processing_time_ms"] = random.randint(50, 500)

    return result
